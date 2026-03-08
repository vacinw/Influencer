package fsa.training.service;

import fsa.training.dao.CategoryRepository;
import fsa.training.dto.CategoryDTO;
import fsa.training.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryDTO(cat.getId(), cat.getName(), cat.getImageUrl()))
                .collect(Collectors.toList());
    }

    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Category name already exists");
        }
        Category category = new Category();
        category.setName(dto.getName());
        category.setImageUrl(dto.getImageUrl());

        Category saved = categoryRepository.save(category);
        return new CategoryDTO(saved.getId(), saved.getName(), saved.getImageUrl());
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if the new name conflicts with an existing category (excluding the
        // current one)
        categoryRepository.findByName(dto.getName())
                .ifPresent(existingCategory -> {
                    if (!existingCategory.getId().equals(id)) {
                        throw new RuntimeException("Category name already exists");
                    }
                });

        category.setName(dto.getName());
        category.setImageUrl(dto.getImageUrl());

        Category updated = categoryRepository.save(category);
        return new CategoryDTO(updated.getId(), updated.getName(), updated.getImageUrl());
    }
}
