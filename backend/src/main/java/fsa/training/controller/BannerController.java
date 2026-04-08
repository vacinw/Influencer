package fsa.training.controller;

import fsa.training.dao.BannerDao;
import fsa.training.entity.Banner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class BannerController {

    @Autowired
    private BannerDao bannerDao;

    // Public Endpoint
    @GetMapping("/banners/active")
    public ResponseEntity<?> getActiveBanners() {
        List<Banner> banners = bannerDao.findByIsActiveTrueOrderByDisplayOrderAsc();
        return ResponseEntity.ok(banners);
    }

    // Admin Endpoints
    @GetMapping("/admin/banners")
    public ResponseEntity<?> getAllBanners() {
        List<Banner> banners = bannerDao.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(banners);
    }

    @PostMapping("/admin/banners")
    public ResponseEntity<?> createBanner(@RequestBody Banner banner) {
        if (banner.getDisplayOrder() == null) {
            banner.setDisplayOrder(0);
        }
        if (banner.getIsActive() == null) {
            banner.setIsActive(true);
        }
        Banner saved = bannerDao.save(banner);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/admin/banners/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        Optional<Banner> optionalBanner = bannerDao.findById(id);
        if (optionalBanner.isPresent()) {
            Banner banner = optionalBanner.get();
            if (bannerDetails.getImageUrl() != null) {
                banner.setImageUrl(bannerDetails.getImageUrl());
            }
            if (bannerDetails.getTargetUrl() != null) {
                banner.setTargetUrl(bannerDetails.getTargetUrl());
            }
            if (bannerDetails.getVideoUrl() != null) {
                banner.setVideoUrl(bannerDetails.getVideoUrl());
            }
            if (bannerDetails.getType() != null) {
                banner.setType(bannerDetails.getType());
            }
            if (bannerDetails.getDisplayOrder() != null) {
                banner.setDisplayOrder(bannerDetails.getDisplayOrder());
            }
            if (bannerDetails.getIsActive() != null) {
                banner.setIsActive(bannerDetails.getIsActive());
            }
            Banner updated = bannerDao.save(banner);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/banners/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        if (bannerDao.existsById(id)) {
            bannerDao.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
