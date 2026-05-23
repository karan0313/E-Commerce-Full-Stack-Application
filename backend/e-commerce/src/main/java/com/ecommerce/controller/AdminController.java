package com.ecommerce.controller;

import com.ecommerce.model.Order;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderService orderService;
    @Autowired private ProductService productService;

    // Dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalOrders   = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalUsers    = userRepository.count();
        double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        return ResponseEntity.ok(Map.of(
                "totalOrders",   totalOrders,
                "totalProducts", totalProducts,
                "totalUsers",    totalUsers,
                "totalRevenue",  totalRevenue
        ));
    }

    // All orders
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Update order status
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                               @RequestBody Map<String, String> body) {
        try {
            OrderStatus status = OrderStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(orderService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // All users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // All products
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Add product
    @PostMapping("/products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.create(product));
    }

    // Update product
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestBody Product product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    // Delete product
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}