package com.ecommerce.service;

import com.ecommerce.model.Product;
import com.ecommerce.model.Review;
import com.ecommerce.model.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Review> getReviews(Long productId) {
        return reviewRepository.findByProductOrderByCreatedAtDesc(getProduct(productId));
    }

    public Map<String, Object> getStats(Long productId) {
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);
        return Map.of(
                "average", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "count", count
        );
    }

    public Review addReview(String email, Long productId, Integer rating, String comment) {
        User user = getUser(email);
        Product product = getProduct(productId);

        if (rating < 1 || rating > 5)
            throw new RuntimeException("Rating must be between 1 and 5");

        // Update existing review if already reviewed
        Review review = reviewRepository.findByUserAndProduct(user, product)
                .orElse(new Review());
        review.setUser(user);
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }

    public void deleteReview(String email, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getUser().getEmail().equals(email))
            throw new RuntimeException("Unauthorized");
        reviewRepository.delete(review);
    }

    public boolean hasReviewed(String email, Long productId) {
        User user = getUser(email);
        Product product = getProduct(productId);
        return reviewRepository.existsByUserAndProduct(user, product);
    }
}