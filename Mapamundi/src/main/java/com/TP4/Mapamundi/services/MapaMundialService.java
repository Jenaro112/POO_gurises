package com.TP4.Mapamundi.services;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.TP4.Mapamundi.model.Continente;
import com.TP4.Mapamundi.model.Pais;
import com.TP4.Mapamundi.model.Provincia;
import com.TP4.Mapamundi.repository.ContinenteRepository;
import com.TP4.Mapamundi.repository.PaisRepository;

@Service
public class MapaMundialService {

    private final PaisRepository paisRepository;
    private final ContinenteRepository continenteRepository;

    public MapaMundialService(PaisRepository paisRepository, ContinenteRepository continenteRepository) {
        this.paisRepository = paisRepository;
        this.continenteRepository = continenteRepository;
    }

    public List<Continente> getTodosLosContinentes() {
        return continenteRepository.findAll();
    }

    public List<Pais> getPaisesDeContinente(String nombreContinente) {
        return continenteRepository.findAll().stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombreContinente))
                .findFirst()
                .map(Continente::getPaises)
                .orElse(List.of());
    }

    public List<Pais> getTodosLosPaises() {
        return paisRepository.findAll();
    }

    public List<Provincia> getProvinciasDePais(String nombrePais) {
        return paisRepository.findByNombreIgnoreCase(nombrePais)
                .map(Pais::getProvincias)
                .orElse(List.of());
    }

    public List<Pais> getPaisesOrdenadosPorSuperficie() {
        List<Pais> todos = paisRepository.findAll();
        todos.sort(Comparator.comparingDouble(Pais::getSuperficie).reversed());
        return todos;
    }

    public Pais compararSuperficie(String pais1, String pais2) {
        Pais p1 = paisRepository.findByNombreIgnoreCase(pais1).orElse(null);
        Pais p2 = paisRepository.findByNombreIgnoreCase(pais2).orElse(null);
        if (p1 == null || p2 == null) return null;
        return p1.getSuperficie() >= p2.getSuperficie() ? p1 : p2;
    }

    public Set<Pais> getLimitrofesDe(String nombre) {
        return paisRepository.findByNombreIgnoreCase(nombre)
                .map(Pais::getLimitrofes)
                .orElse(Set.of());
    }
}
