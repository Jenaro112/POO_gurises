package com.TP4.Mapamundi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TP4.Mapamundi.model.Pais;

public interface PaisRepository extends JpaRepository<Pais, Long> {
    Optional<Pais> findByNombreIgnoreCase(String nombre);
}
