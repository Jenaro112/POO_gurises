package com.TP4.Mapamundi.controller;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TP4.Mapamundi.model.Continente;
import com.TP4.Mapamundi.model.Pais;
import com.TP4.Mapamundi.model.Provincia;
import com.TP4.Mapamundi.services.MapaMundialService;

@RestController
@RequestMapping("/mapa")
@CrossOrigin(origins = "*") // Por si accedés desde HTML local
public class MapaMundialController {

    private final MapaMundialService service;

    public MapaMundialController(MapaMundialService service) {
        this.service = service;
    }

    @GetMapping("/continentes")
    public List<Continente> getContinentes() {
        return service.getTodosLosContinentes();
    }

    @GetMapping("/paises")
    public List<Pais> getPaises(@RequestParam String continente) {
        return service.getPaisesDeContinente(continente);
    }

    @GetMapping("/paisesTodos")
    public List<Pais> getTodosLosPaises() {
        return service.getTodosLosPaises();
    }

    @GetMapping("/paisesOrdenados")
    public List<Pais> getPaisesOrdenados() {
        return service.getPaisesOrdenadosPorSuperficie();
    }

    @GetMapping("/provincias")
    public List<Provincia> getProvincias(@RequestParam String pais) {
        return service.getProvinciasDePais(pais);
    }

    @GetMapping("/comparar")
    public Pais compararPaises(@RequestParam String pais1, @RequestParam String pais2) {
        return service.compararSuperficie(pais1, pais2);
    }

    @GetMapping("/limitrofes")
    public Set<Pais> getLimitrofes(@RequestParam String pais) {
        return service.getLimitrofesDe(pais);
    }
}
