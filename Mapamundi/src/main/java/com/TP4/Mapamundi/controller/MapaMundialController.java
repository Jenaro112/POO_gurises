package com.TP4.Mapamundi.controller;

import java.util.List;

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

    @GetMapping("/provincias")
    public List<Provincia> getProvincias(@RequestParam String pais) {
        return service.getProvinciasDePais(pais);
    }
}

//! USAR ESTAS URL PARA VER SI ANDAN :)
//* http://localhost:8080/mapa/continentes
//* http://localhost:8080/mapa/paises?continente=America
//* http://localhost:8080/mapa/provincias?pais=Argentina

//? Cuando pongo para ver los paises del continente america me sale una lista vacia; consultar y en lo posible corregir
