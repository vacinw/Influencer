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

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        String token = jwtUtils.generateJwtToken(authentication);

        String redirectUrl = frontendUrl + "/role-selection?token=" + token;

        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            redirectUrl = frontendUrl + "/admin/dashboard?token=" + token;
        } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_CREATOR"))) {
            redirectUrl = frontendUrl + "/creator/dashboard?token=" + token;
        } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_RECEIVER"))) {
            redirectUrl = frontendUrl + "/receiver/dashboard?token=" + token;
        }

        response.sendRedirect(redirectUrl);
    }
}
