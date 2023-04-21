
const HELDENPUNKTEFAKTOR = 5

//TODO Enum für Eigenschaften einrichten

/**
 * Gibt den Wert der Steigerungsfunktion nach Stunden, Schwierigkeit und Begabung zurück.
 * Keine Grundverschiebung, keine Untergrenze. Verwendet die neue Funktion ohne die 16er-Grundverschiebung.
 * @param stunden
 * @param schwierigkeit
 * @param begabung
 * @returns {number}
 */
function get_wert(stunden,
                  schwierigkeit = 1,
                  begabung = 1){
    return (6 ** (1 / 3) * stunden ** (1 / 3)) / 5 ** (2 / 3) * begabung / schwierigkeit
}

/**
 * Gibt die Anzahl an Stunden zurück, die nötig sind um den übergebenen Wert zu erreichen
 * @param wert
 * @param schwierigkeit
 * @param begabung
 * @returns {number}
 */
function get_stunden(wert, schwierigkeit, begabung){
    return (25 * schwierigkeit**3 *wert**3 /begabung) / 6
}

/**
 * Gibt den Wert mit der Aktuellen Heldenpunkteverrechnung zurück.
 * Geht davon aus, das Heldenpunkte als Schwierigkeit immer 1 annehmen aber das Begabung berücksichtigt wird.
 * Setzt voraus, das HELDENPUNKTEFAKTOR gesetzt ist.
 * @param stunden
 * @param heldenpunkte
 * @param schwierigkeit
 * @param begabung
 * @returns {number}
 */
function get_wert_mit_heldenpunkten(stunden, heldenpunkte, schwierigkeit, begabung) {
    let heldenpunktestunden = get_stunden(
        get_wert((heldenpunkte * HELDENPUNKTEFAKTOR), 1),
        schwierigkeit)
    return get_wert(stunden + heldenpunktestunden, schwierigkeit, begabung )
}