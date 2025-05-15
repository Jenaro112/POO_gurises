package com.TP4.Mapamundi.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class Pais {
    private String nombre;
    private String capital;
    private double superficie;
    private List<Provincia> provincias;
    private String continente;
}

