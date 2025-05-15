package com.TP4.Mapamundi.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class Continente {

    private String nombre;
    private List<Pais> paises;
}
