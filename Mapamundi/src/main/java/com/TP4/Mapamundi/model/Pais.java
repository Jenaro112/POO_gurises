package com.TP4.Mapamundi.model;

import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pais {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String capital;
    private double superficie;

    @ManyToOne
    @EqualsAndHashCode.Exclude  // Para evitar recursión infinita
    private Continente continente;

    @OneToMany(cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude  // Para evitar recursión infinita
    private List<Provincia> provincias;

    @ManyToMany
    @JoinTable(
        name = "limites",
        joinColumns = @JoinColumn(name = "pais_id"),
        inverseJoinColumns = @JoinColumn(name = "limitrofe_id")
    )
    @EqualsAndHashCode.Exclude  // Para evitar recursión infinita en la relación bidireccional
    private Set<Pais> limitrofes;
}
