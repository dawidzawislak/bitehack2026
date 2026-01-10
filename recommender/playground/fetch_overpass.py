import requests
import json

def fetch_overpass_data():
    """
    Pobiera dane o atrakcjach turystycznych w Krakowie z Overpass API
    """
    # Endpoint Overpass API
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Query Overpass
    overpass_query = """
    [out:json];
    area["name"="Kraków"]->.searchArea;
    (
      node["tourism"="attraction"](area.searchArea);
      way["tourism"="attraction"](area.searchArea);
      relation["tourism"="attraction"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
    """
    
    try:
        # Wysłanie zapytania POST do API
        print("Pobieranie danych z Overpass API...")
        response = requests.post(overpass_url, data={'data': overpass_query})
        response.raise_for_status()
        
        # Parsowanie odpowiedzi JSON
        data = response.json()
        
        # Wyświetlenie informacji o pobranych danych
        elements = data.get('elements', [])
        print(f"Pobrano {len(elements)} elementów")
        
        # Zapisanie do pliku
        output_file = "krakow_attractions.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Dane zapisane do pliku: {output_file}")
        
        # Wyświetlenie przykładowych danych
        if elements:
            print("\nPrzykładowe atrakcje:")
            for i, element in enumerate(elements[:5]):
                if 'tags' in element and 'name' in element['tags']:
                    print(f"{i+1}. {element['tags']['name']}")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Błąd podczas pobierania danych: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Błąd podczas parsowania JSON: {e}")
        return None

if __name__ == "__main__":
    fetch_overpass_data()
