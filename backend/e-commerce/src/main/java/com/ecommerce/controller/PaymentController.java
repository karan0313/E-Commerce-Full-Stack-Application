package com.ecommerce.controller;

import com.ecommerce.model.Order;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.Principal;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final OrderRepository orderRepository;

    public PaymentController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Step 1 — Create Razorpay order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body,
                                         Principal principal) {
        try {
            Long orderId = Long.parseLong(body.get("orderId").toString());
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            if (!order.getUser().getEmail().equals(principal.getName())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
            }

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", (int)(order.getTotalAmount() * 100)); // paise
            options.put("currency", "INR");
            options.put("receipt", "order_" + orderId);

            com.razorpay.Order razorpayOrder = client.orders.create(options);

            return ResponseEntity.ok(Map.of(
                    "razorpayOrderId", razorpayOrder.get("id"),
                    "amount",          razorpayOrder.get("amount"),
                    "currency",        razorpayOrder.get("currency"),
                    "keyId",           keyId,
                    "orderId",         orderId,
                    "customerName",    order.getUser().getName(),
                    "customerEmail",   order.getUser().getEmail()
            ));

        } catch (RazorpayException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // Step 2 — Verify payment signature + update order
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body) {
        try {
            String razorpayOrderId  = body.get("razorpayOrderId");
            String razorpayPaymentId = body.get("razorpayPaymentId");
            String razorpaySignature = body.get("razorpaySignature");
            Long orderId = Long.parseLong(body.get("orderId"));

            // Verify HMAC signature
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            String generated = HexFormat.of().formatHex(mac.doFinal(payload.getBytes()));

            if (!generated.equals(razorpaySignature)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid payment signature"));
            }

            // Update order status
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "message", "Payment verified successfully",
                    "orderId", orderId,
                    "status",  "PROCESSING"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}