package com.TP4.Mapamundi.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.TP4.Mapamundi.model.Continente;
import com.TP4.Mapamundi.model.Pais;
import com.TP4.Mapamundi.model.Provincia;

@Service
public class MapaMundialService {

    private final List<Continente> continentes = new ArrayList<>();

    public MapaMundialService() {
        // Crear provincias
        List<Provincia> provinciasArg = List.of(
                new Provincia("Entre Ríos"), new Provincia("Buenos Aires"),
                new Provincia("Santa Fé"), new Provincia("Corrientes"), new Provincia("Córdoba")
        );

        List<Provincia> provinciasUru = List.of(
                new Provincia("Salto"), new Provincia("Paysandú"),
                new Provincia("Canelones"), new Provincia("Rocha"), new Provincia("Maldonado")
        );

        // Crear países
        Pais argentina = new Pais("Argentina", "Buenos Aires", 2780400, provinciasArg, "América");
        Pais uruguay = new Pais("Uruguay", "Montevideo", 176215, provinciasUru, "América");
        Pais brasil = new Pais("Brasil", "Brasilia", 8515767, List.of(), "América");

        Pais espana = new Pais("España", "Madrid", 505990, List.of(), "Europa");

        // Crear continentes
        Continente america = new Continente("América", List.of(argentina, uruguay, brasil));
        Continente europa = new Continente("Europa", List.of(espana));

        continentes.addAll(List.of(america, europa));
    }

    public List<Pais> getPaisesDeContinente(String nombreContinente) {
        return continentes.stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombreContinente))
                .findFirst()
                .map(Continente::getPaises)
                .orElse(List.of());
    }

    public List<Provincia> getProvinciasDePais(String nombrePais) {
        return continentes.stream()
                .flatMap(c -> c.getPaises().stream())
                .filter(p -> p.getNombre().equalsIgnoreCase(nombrePais))
                .findFirst()
                .map(Pais::getProvincias)
                .orElse(List.of());
    }

    public List<Continente> getTodosLosContinentes() {
        return continentes;
    }
}
