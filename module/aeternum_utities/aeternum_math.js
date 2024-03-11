/**
 * Impementiert nach meiner Python Implementierung
 * @param {*} hours der Stundenwert des Charakters 
 * @returns den Wert wenn man nur Stunden betrachtet
 */
function _get_value_by_hours(hours){
  let f1 = 6 ** (1/3);
  let f2 = hours ** (2/3);
  let d1= 5 ** (2/3);
  return f1 * f2 / d1;
}


function _get_value_by_hours_and_factors(hours, difficulty, aptitude) {
    return _get_value_by_hours(hours) / difficulty * aptitude;
}

function _get_hours_by_value_and_factors(value, aptitude, difficulty){
    return ((25 * value ** 3) / 6) * (difficulty ** 3 / aptitude ** 3);
}

/**
 * Berechnet die Steigerungsobergrenze nach den Regeln im Handbuch
 * @param {*} aptitude 
 * @param {*} special_experiences 
 * @returns 
 */
function calculate_steigerungsgrenze(aptitude, special_experiences){
    grenzen = {
        0: 4, 
        1: 7,
        2: 10,
        3: 12,
        4: 14
    }
    result = Math.max(grenzen[special_experiences], (10 + special_experiences )) * aptitude;
    return Math.floor(result);
}

/**
 * Gibt den abgerundeten Wert mit permanenten allen Modifikatoren zurück.
 * @param {*} heldenpunktefaktor 
 * @param {*} stunden 
 * @param {*} heldenpunkte 
 * @param {*} begabung 
 * @param {*} schwierigkeit 
 * @returns 
 */
function get_value_of_steigerbar(
    heldenpunktefaktor, 
    stunden,
    heldenpunkte,
    begabung, 
    schwierigkeit
){
    let nach_heldenpunkten = _get_value_by_hours(heldenpunkte * heldenpunktefaktor);
    let stunden_nach_heldenpunkten = _get_value_by_hours_and_factors(stunden, schwierigkeit, begabung);
    stunden = stunden + stunden_nach_heldenpunkten;
    result = _get_value_by_hours_and_factors(stunden, begabung, schwierigkeit);
    return Math.floor(result);
}

function get_value_of_steigerbar_with_steigerungsgrenze(
    heldenpunktefaktor, 
    stunden,
    heldenpunkte,
    begabung, 
    schwierigkeit,
    spezielle_erfahrungen
) {
    return Math.min(
        calculate_steigerungsgrenze(
            begabung, 
            spezielle_erfahrungen), 
        get_value_of_steigerbar(
            heldenpunktefaktor, 
            stunden, 
            heldenpunkte, 
            begabung, 
            schwierigkeit)
            );
}

export {
    calculate_steigerungsgrenze,
    get_value_of_steigerbar,
    get_value_of_steigerbar_with_steigerungsgrenze 
}