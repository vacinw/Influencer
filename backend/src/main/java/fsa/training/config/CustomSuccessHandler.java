package fsa.training.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomSuccessHandler implements AuthenticationSuccessHandler {

    @org.springframework.beans.factory.annotation.Autowired
    private fsa.training.security.jwt.JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        String token = jwtUtils.generateJwtToken(authentication);
        
        // Create a short-lived cookie for token transfer
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("AUTH_TOKEN", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(60); // 60 seconds is enough for the frontend to grab it
        response.addCookie(cookie);

        String redirectUrl = "http://localhost:5173/role-selection";

        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            redirectUrl = "http://localhost:5173/admin/dashboard";
        } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_CREATOR"))) {
            redirectUrl = "http://localhost:5173/creator/dashboard";
        } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_RECEIVER"))) {
            redirectUrl = "http://localhost:5173/receiver/dashboard";
        }

        response.sendRedirect(redirectUrl);
    }
}
