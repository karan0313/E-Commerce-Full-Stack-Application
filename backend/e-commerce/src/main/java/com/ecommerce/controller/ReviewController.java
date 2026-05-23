package com.ecommerce.controller;

import com.ecommerce.dto.ReviewRequest;
import com.ecommerce.model.Review;
import com.ecommerce.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Get all reviews for a product
    @GetMapping("/product/{productId}")
    public List<Review> getReviews(@PathVariable Long productId) {
        return reviewService.getReviews(productId);
    }

    // Get avg rating + count for a product
    @GetMapping("/product/{productId}/stats")
    public Map<String, Object> getStats(@PathVariable Long productId) {
        return reviewService.getStats(productId);
    }

    // Check if current user has reviewed
    @GetMapping("/product/{productId}/mine")
    public ResponseEntity<?> hasReviewed(@PathVariable Long productId, Principal principal) {
        boolean has = reviewService.hasReviewed(principal.getName(), productId);
        return ResponseEntity.ok(Map.of("hasReviewed", has));
    }

    // Add or update review
    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addReview(@PathVariable Long productId,
                                       @RequestBody ReviewRequest req,
                                       Principal principal) {
        try {
            Review review = reviewService.addReview(
                    principal.getName(), productId, req.getRating(), req.getComment()
            );
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete own review
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId, Principal principal) {
        try {
            reviewService.deleteReview(principal.getName(), reviewId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}