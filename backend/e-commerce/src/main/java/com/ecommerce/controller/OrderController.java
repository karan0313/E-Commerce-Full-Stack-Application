package com.ecommerce.controller;

import com.ecommerce.dto.CheckoutRequest;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Place order from cart
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody CheckoutRequest req, Principal principal) {
        try {
            Order order = orderService.placeOrder(principal.getName(), req.getShippingAddress());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get my orders
    @GetMapping
    public List<Order> getMyOrders(Principal principal) {
        return orderService.getMyOrders(principal.getName());
    }

    // Get single order
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(principal.getName(), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: get all orders
    @GetMapping("/admin/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Admin: update order status
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            OrderStatus status = OrderStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(orderService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}