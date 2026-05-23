package com.ecommerce.controller;

import com.ecommerce.dto.CartRequest;
import com.ecommerce.model.CartItem;
import com.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public List<CartItem> getCart(Principal principal) {
        return cartService.getCart(principal.getName());
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@RequestBody CartRequest req, Principal principal) {
        CartItem item = cartService.addToCart(principal.getName(), req.getProductId(), req.getQuantity());
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long itemId,
                                                   @RequestBody CartRequest req,
                                                   Principal principal) {
        CartItem item = cartService.updateQuantity(principal.getName(), itemId, req.getQuantity());
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId, Principal principal) {
        cartService.removeItem(principal.getName(), itemId);
        return ResponseEntity.noContent().build();
    }
}