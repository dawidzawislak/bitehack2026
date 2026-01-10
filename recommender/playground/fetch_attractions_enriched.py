import requests
import json
import time
from typing import List, Dict, Optional

def fetch_geoapify_places():
    """
    Pobiera szczegółowe dane o atrakcjach turystycznych w Krakowie z Geoapify API
    """
    geoapify_url = "https://api.geoapify.com/v2/places"
    
    params = {
        'categories': 'entertainment,leisure,natural,national_park,tourism,adult,sport,religion,beach,catering,accommodation',
        'filter': 'rect:19.83109029839192,50.12573410110706,20.04664289886501,49.98617978536494',  # Kraków
        'limit': 500,
        'apiKey': '65f53b555b2a4cf9b1104ed4d629f70b'
    }
    
    print("Pobieranie danych z Geoapify API...")
    response = requests.get(geoapify_url, params=params)
    response.raise_for_status()
    
    data = response.json()
    features = data.get('features', [])
    print(f"Pobrano {len(features)} miejsc z Geoapify API")
    return features

def categorize_from_geoapify(categories: List[str]) -> List[str]:
    """Konwertuje kategorie Geoapify na proste kategorie"""
    result_categories = set()
    
    category_mapping = {
        'history': ['heritage', 'historic', 'monument', 'memorial', 'castle', 'ruins'],
        'art': ['museum', 'gallery', 'art', 'artwork'],
        'culture': ['museum', 'gallery', 'theatre', 'cultural'],
        'religion': ['religion', 'place_of_worship', 'church', 'cathedral', 'monastery', 'chapel'],
        'nature': ['natural', 'park', 'garden', 'forest', 'lake', 'river', 'beach'],
        'outdoor': ['park', 'garden', 'viewpoint', 'outdoor', 'sport'],
        'architecture': ['building', 'castle', 'tower', 'bridge', 'historic'],
        'entertainment': ['entertainment', 'nightlife', 'cinema', 'theatre'],
        'food': ['catering', 'restaurant', 'cafe', 'bar', 'food'],
        'shopping': ['commercial', 'shop', 'market'],
        'sport': ['sport', 'leisure', 'activity'],
        'accommodation': ['accommodation', 'hotel', 'hostel']
    }
    
    for category in categories:
        category_lower = category.lower()
        for main_cat, keywords in category_mapping.items():
            if any(keyword in category_lower for keyword in keywords):
                result_categories.add(main_cat)
    
    # Domyślna kategoria
    if not result_categories:
        result_categories.add('attraction')
    
    return sorted(list(result_categories))

def estimate_visit_time_from_categories(categories: List[str], properties: Dict) -> str:
    """Szacuje czas wizyty na podstawie kategorii i typu miejsca"""
    raw = properties.get('datasource', {}).get('raw', {})
    
    # Muzea i galerie
    if any('museum' in cat or 'gallery' in cat for cat in categories):
        return '90-120 min'
    
    # Zamki i pałace
    if any('castle' in cat for cat in categories) or raw.get('historic') == 'castle':
        return '60-90 min'
    
    # Kościoły i katedry
    if any('cathedral' in cat for cat in categories):
        return '30-45 min'
    elif any('church' in cat or 'chapel' in cat for cat in categories):
        return '15-30 min'
    
    # Punkty widokowe
    if any('viewpoint' in cat for cat in categories):
        return '10-20 min'
    
    # Parki i ogrody
    if any('park' in cat or 'garden' in cat for cat in categories):
        return '45-90 min'
    
    # Restauracje i kawiarnie
    if any('restaurant' in cat or 'cafe' in cat for cat in categories):
        return '60-90 min'
    
    # Domyślny czas
    return '30-60 min'

def calculate_popularity_score(properties: Dict) -> int:
    """
    Oblicza popularność (1-10) na podstawie dostępnych danych
    """
    score = 5  # Bazowy wynik
    
    raw = properties.get('datasource', {}).get('raw', {})
    wiki_media = properties.get('wiki_and_media', {})
    
    # Bonus za UNESCO/heritage
    heritage = properties.get('heritage', {})
    if heritage.get('level') == 2:  # Światowe dziedzictwo
        score += 3
    elif heritage.get('level') == 1:
        score += 2
    
    # Bonus za Wikipedię
    if wiki_media.get('wikipedia'):
        score += 2
    
    # Bonus za wiele języków (popularne miejsce)
    name_intl = properties.get('name_international', {})
    if len(name_intl) > 10:
        score += 1
    elif len(name_intl) > 5:
        score += 0.5
    
    # Bonus za obrazek
    if wiki_media.get('image') or wiki_media.get('wikimedia_commons'):
        score += 0.5
    
    return min(10, int(score))

def estimate_price_level(properties: Dict, categories: List[str]) -> Optional[int]:
    """
    Szacuje poziom cenowy (0-4)
    0 = darmowe, 1 = tanie, 2 = średnie, 3 = drogie, 4 = bardzo drogie
    """
    raw = properties.get('datasource', {}).get('raw', {})
    
    # Sprawdź tag fee
    fee = raw.get('fee')
    if fee == 'no':
        return 0
    
    # Kościoły zwykle darmowe (chyba że fee=yes)
    if any('religion' in cat for cat in categories) and not fee:
        return 0
    
    # Parki publiczne zwykle darmowe
    if any('park' in cat for cat in categories) and raw.get('access') == 'yes':
        return 0
    
    # Muzea zwykle płatne
    if any('museum' in cat for cat in categories):
        return 2  # Średni koszt
    
    # Restauracje i kawiarnie
    if any('restaurant' in cat or 'cafe' in cat for cat in categories):
        return 2
    
    # Hotele
    if any('accommodation' in cat for cat in categories):
        return 3
    
    return None  # Nieznany

def transform_to_place_format(features: List[Dict]) -> List[Dict]:
    """
    Przekształca dane z Geoapify API do wymaganego formatu
    """
    places = []
    
    for feature in features:
        properties = feature.get('properties', {})
        geometry = feature.get('geometry', {})
        
        # Podstawowe dane
        name = properties.get('name')
        if not name:
            continue
        
        # Współrzędne
        coordinates = geometry.get('coordinates', [])
        if len(coordinates) < 2:
            continue
        
        lng, lat = coordinates[0], coordinates[1]
        
        # Kategorie
        geoapify_categories = properties.get('categories', [])
        categories = categorize_from_geoapify(geoapify_categories)
        
        # Dane z datasource.raw (OSM)
        raw = properties.get('datasource', {}).get('raw', {})
        
        place = {
            # Podstawowe informacje
            'id': properties.get('place_id'),
            'name': name,
            'name_international': properties.get('name_international', {}),
            'name_other': properties.get('name_other', {}),
            'lat': lat,
            'lng': lng,
            
            # Adres
            'formatted_address': properties.get('formatted'),
            'address_line1': properties.get('address_line1'),
            'address_line2': properties.get('address_line2'),
            'street': properties.get('street'),
            'housenumber': properties.get('housenumber'),
            'postcode': properties.get('postcode'),
            'city': properties.get('city'),
            'district': properties.get('district'),
            'suburb': properties.get('suburb'),
            'country': properties.get('country'),
            'country_code': properties.get('country_code'),
            
            # Kategorie i klasyfikacja
            'categories': categories,
            'geoapify_categories': geoapify_categories,  # Pełna lista kategorii
            
            # Czas i popularność
            'avg_visit_time': estimate_visit_time_from_categories(geoapify_categories, properties),
            'popularity': calculate_popularity_score(properties),
            'local_score': None,  # Będzie uzupełnione przez Wikipedia/Foursquare
            'price_level': estimate_price_level(properties, geoapify_categories),
            
            # Godziny otwarcia
            'opening_hours': properties.get('opening_hours'),
            
            # Kontakt
            'contact': properties.get('contact', {}),
            'phone': properties.get('contact', {}).get('phone'),
            'email': properties.get('contact', {}).get('email'),
            'website': properties.get('website'),
            'website_other': properties.get('website_other', []),
            
            # Udogodnienia
            'facilities': properties.get('facilities', {}),
            'wheelchair_accessible': properties.get('facilities', {}).get('wheelchair'),
            
            # Dziedzictwo i kultura
            'heritage': properties.get('heritage', {}),
            'building': properties.get('building', {}),
            'place_of_worship': properties.get('place_of_worship', {}),
            
            # Wikipedia i media
            'wiki_and_media': properties.get('wiki_and_media', {}),
            'wikipedia': properties.get('wiki_and_media', {}).get('wikipedia'),
            'wikidata': properties.get('wiki_and_media', {}).get('wikidata'),
            'image': properties.get('wiki_and_media', {}).get('image'),
            'wikimedia_commons': properties.get('wiki_and_media', {}).get('wikimedia_commons'),
            
            # Dodatkowe dane z OSM
            'osm_type': raw.get('osm_type'),
            'osm_id': raw.get('osm_id'),
            'description': raw.get('description'),
            
            # Referencje
            'ref_other': properties.get('ref_other', {}),
            
            # Oryginalne dane dla debugowania
            'datasource': properties.get('datasource', {}).get('sourcename'),
        }
        
        places.append(place)
    
    return places

def enrich_with_wikipedia(places: List[Dict]) -> List[Dict]:
    """
    Wzbogaca dane o informacje z Wikipedia i Wikidata (całkowicie darmowe!)
    """
    print("\n🔍 Wzbogacam dane przez Wikipedia i Wikidata...")
    
    enriched_count = 0
    
    for i, place in enumerate(places):
        if (i + 1) % 10 == 0:
            print(f"  Przetworzono {i+1}/{len(places)} miejsc...")
        
        # Jeśli mamy już link do Wikipedii z OSM
        wikipedia_title = None
        if place.get('wikipedia'):
            # Format: "pl:Nazwa artykułu" lub "en:Article name"
            if ':' in place['wikipedia']:
                lang, title = place['wikipedia'].split(':', 1)
                wikipedia_title = title
                wikipedia_lang = lang
            else:
                wikipedia_title = place['wikipedia']
                wikipedia_lang = 'pl'
        
        # Próbuj znaleźć artykuł przez wyszukiwanie
        if not wikipedia_title:
            search_url = "https://pl.wikipedia.org/w/api.php"
            search_params = {
                'action': 'opensearch',
                'search': place['name'] + ' Kraków',
                'limit': 1,
                'namespace': 0,
                'format': 'json'
            }
            
            try:
                response = requests.get(search_url, params=search_params)
                response.raise_for_status()
                results = response.json()
                
                if results[1]:  # Jeśli znaleziono wyniki
                    wikipedia_title = results[1][0]
                    wikipedia_lang = 'pl'
            except:
                pass
        
        # Jeśli mamy tytuł, pobierz szczegóły
        if wikipedia_title:
            try:
                # Pobierz dane z Wikipedia
                wiki_url = f"https://{wikipedia_lang}.wikipedia.org/w/api.php"
                wiki_params = {
                    'action': 'query',
                    'titles': wikipedia_title,
                    'prop': 'extracts|pageviews|categories|info',
                    'exintro': True,
                    'explaintext': True,
                    'inprop': 'url',
                    'format': 'json'
                }
                
                response = requests.get(wiki_url, params=wiki_params)
                response.raise_for_status()
                data = response.json()
                
                pages = data.get('query', {}).get('pages', {})
                if pages:
                    page = list(pages.values())[0]
                    
                    # Dodaj opis
                    if page.get('extract'):
                        place['description'] = page['extract'][:500]  # Pierwsze 500 znaków
                    
                    # Popularność na podstawie wyświetleń
                    pageviews = page.get('pageviews', {})
                    if pageviews:
                        avg_views = sum(v for v in pageviews.values() if v) / len(pageviews)
                        # Konwersja wyświetleń na skalę 1-10
                        if avg_views > 1000:
                            place['popularity'] = 10
                        elif avg_views > 500:
                            place['popularity'] = 9
                        elif avg_views > 200:
                            place['popularity'] = 8
                        elif avg_views > 100:
                            place['popularity'] = 7
                        else:
                            place['popularity'] = max(6, place['popularity'])
                    
                    # Ocena na podstawie popularności i kategorii
                    categories = page.get('categories', [])
                    category_names = [cat.get('title', '') for cat in categories]
                    
                    # Jeśli jest w kategorii zabytków/UNESCO -> wyższa ocena
                    if any('UNESCO' in cat or 'Zabytek' in cat or 'Monument' in cat for cat in category_names):
                        place['local_score'] = 4.8
                        place['popularity'] = min(10, place['popularity'] + 1)
                    elif any('Muzeum' in cat or 'Museum' in cat for cat in category_names):
                        place['local_score'] = 4.5
                    else:
                        place['local_score'] = 4.2
                    
                    # URL do Wikipedii
                    if page.get('fullurl'):
                        place['wikipedia_url'] = page['fullurl']
                    
                    enriched_count += 1
                
                time.sleep(0.1)  # Delikatne opóźnienie dla Wikipedia
                
            except Exception as e:
                continue
    
    print(f"  ✅ Wzbogacono {enriched_count}/{len(places)} miejsc danymi z Wikipedii\n")
    return places

def enrich_with_foursquare(places: List[Dict], api_key: Optional[str] = None) -> List[Dict]:
    """
    Wzbogaca dane o informacje z Foursquare Places API (darmowe!)
    API Key można zdobyć za darmo na: https://foursquare.com/developers/signup
    """
    if not api_key:
        print("\n⚠️  Brak klucza Foursquare API - pomijam wzbogacanie")
        print("💡 Aby wzbogacić dane oceną i popularnością (za darmo!):")
        print("1. Zarejestruj się: https://foursquare.com/developers/signup")
        print("2. Utwórz aplikację i skopiuj klucz API")
        print("3. W skrypcie ustaw: FOURSQUARE_API_KEY = 'twoj_klucz'\n")
        return places
    
    print("\n🔍 Wzbogacam dane przez Foursquare...")
    
    base_url = "https://api.foursquare.com/v3/places/search"
    headers = {
        'Authorization': api_key,
        'Accept': 'application/json'
    }
    
    enriched_count = 0
    
    for i, place in enumerate(places):
        if (i + 1) % 10 == 0:
            print(f"  Przetworzono {i+1}/{len(places)} miejsc...")
        
        params = {
            'll': f"{place['lat']},{place['lng']}",
            'radius': 50,  # 50 metrów
            'query': place['name'],
            'limit': 1
        }
        
        try:
            response = requests.get(base_url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get('results'):
                result = data['results'][0]
                
                # Ocena i popularność
                if result.get('rating'):
                    place['local_score'] = round(result['rating'] / 2, 1)  # Foursquare 0-10 -> 0-5
                
                if result.get('popularity'):
                    place['popularity'] = min(10, int(result['popularity'] * 10))
                
                # Kategorie
                if result.get('categories'):
                    for cat in result['categories']:
                        cat_name = cat.get('name', '').lower()
                        if 'museum' in cat_name and 'art' not in place['categories']:
                            place['categories'].append('art')
                        elif 'church' in cat_name and 'religion' not in place['categories']:
                            place['categories'].append('religion')
                
                enriched_count += 1
            
            time.sleep(0.1)
            
        except Exception as e:
            continue
    
    print(f"  ✅ Wzbogacono {enriched_count}/{len(places)} miejsc danymi z Foursquare\n")
    return places

def enrich_with_nominatim(places: List[Dict]) -> List[Dict]:
    """
    Dodatkowe wzbogacanie danych przez Nominatim (OpenStreetMap) - pomijamy, bo Geoapify już ma te dane
    """
    print("\n✅ Pomijam Nominatim - Geoapify już zawiera dane adresowe z OSM\n")
    return places

def save_places_to_json(places: List[Dict], filename: str = "krakow_places_enriched.json"):
    """Zapisuje miejsca do pliku JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Zapisano {len(places)} miejsc do pliku: {filename}")

def main():
    # Krok 1: Pobierz dane z Geoapify API (zawiera już dane z OSM)
    features = fetch_geoapify_places()
    
    # Krok 2: Przekształć do wymaganego formatu
    places = transform_to_place_format(features)
    print(f"Przetworzono {len(places)} miejsc z pełnymi danymi")
    
    # Krok 3a: Pomiń Nominatim (Geoapify już ma te dane)
    places = enrich_with_nominatim(places)
    
    # Krok 3b: Wzbogać danymi z Wikipedia (całkowicie darmowe!)
    places = enrich_with_wikipedia(places)
    
    # Krok 3c: Opcjonalnie wzbogać o dane z Foursquare API (darmowe, ale wymaga klucza)
    # Zarejestruj się na: https://foursquare.com/developers/signup
    # Odkomentuj poniższe linie i wklej swój klucz:
    # FOURSQUARE_API_KEY = "fsq3XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    # places = enrich_with_foursquare(places, FOURSQUARE_API_KEY)
    
    places = enrich_with_foursquare(places)  # Bez klucza - tylko ostrzeżenie
    
    # Krok 4: Zapisz do pliku
    save_places_to_json(places)
    
    # Statystyki
    print("\n📊 Statystyki:")
    print(f"  Łączna liczba miejsc: {len(places)}")
    
    # Kategorie
    all_categories = {}
    for place in places:
        for cat in place['categories']:
            all_categories[cat] = all_categories.get(cat, 0) + 1
    
    print(f"\n  Kategorie (top 10):")
    for cat, count in sorted(all_categories.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"    {cat}: {count}")
    
    # Miejsca z opening hours
    with_hours = sum(1 for p in places if p.get('opening_hours'))
    print(f"\n  Miejsca z godzinami otwarcia: {with_hours}/{len(places)}")
    
    # Miejsca z wheelchair access
    wheelchair = sum(1 for p in places if p.get('wheelchair_accessible'))
    print(f"  Miejsca dostępne dla wózków: {wheelchair}/{len(places)}")
    
    # Wyświetl przykładowe dane
    print("\n📍 Przykładowe miejsca:")
    for place in places[:3]:
        print(f"\n{'='*60}")
        print(f"Nazwa: {place['name']}")
        if place.get('name_international', {}).get('en'):
            print(f"Nazwa EN: {place['name_international']['en']}")
        print(f"Lokalizacja: {place.get('lat', 'N/A')}, {place.get('lng', 'N/A')}")
        if place.get('formatted_address'):
            print(f"Adres: {place['formatted_address']}")
        print(f"Kategorie: {', '.join(place['categories'])}")
        print(f"Kategorie szczegółowe: {len(place.get('geoapify_categories', []))} typów")
        print(f"Czas wizyty: {place['avg_visit_time']}")
        print(f"Popularność: {place['popularity']}/10")
        if place.get('local_score'):
            print(f"Ocena: {place['local_score']}/5")
        if place.get('price_level') is not None:
            price_labels = ['Darmowe', 'Tanie', 'Średnie', 'Drogie', 'Bardzo drogie']
            print(f"Cena: {price_labels[place['price_level']]}")
        if place.get('opening_hours'):
            print(f"Godziny: {place['opening_hours']}")
        if place.get('phone'):
            print(f"Telefon: {place['phone']}")
        if place.get('website'):
            print(f"Strona: {place['website']}")
        if place.get('wheelchair_accessible'):
            print(f"♿ Dostępne dla wózków")
        if place.get('description'):
            print(f"Opis: {place['description'][:150]}...")
    
    print(f"\n{'='*60}")

if __name__ == "__main__":
    main()
