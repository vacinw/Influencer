package fsa.training.security;

import fsa.training.dao.UserDao;
import fsa.training.entity.Role;
import fsa.training.entity.User;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserDao userDao;

    public CustomOAuth2UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userDao.findByEmail(email);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            // OAuth2 users don't need a password, but DB requires it. Set a random one.
            user.setPassword(UUID.randomUUID().toString());

            // Default role? Assuming user has a default role mechanism or null is okay for
            // now.
            // Ideally we should fetch a default role from DB.
            // user.setRole(defaultRole);

            userDao.save(user);
        } else {
            // Update name if changed?
            if (!user.getName().equals(name)) {
                user.setName(name);
                userDao.save(user);
            }
        }

        return oAuth2User;
    }
}
