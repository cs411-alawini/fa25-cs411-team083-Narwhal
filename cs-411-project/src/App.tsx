import { useEffect, useState, type SetStateAction } from "react";
import "./App.css";

interface Medicine {
  name: string;
  rating: number;
  symptoms_treated: number;
  //can add more things in the final product
}

interface MedicineRaw {
  medicine_name: string;
  medicine_rating: string;
  symptoms_treated: string;
  //can add more things in the final product
}

interface Location {
  address: string;
  city: string;
  state: string;
}

function App() {
  const [nextSymptom, setNextSymptom] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [hoveredMedicine, setHoveredMedicine] = useState("");

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  //api specific states
  const [findMedicineError, setFindMedicineError] = useState(false);
  const [findMedicineLoading, setFindMedicineLoading] = useState(false);

  const [findLocationsError, setFindLocationsError] = useState(false);
  const [findLocationsLoading, setFindLocationsLoading] = useState(false);

  useEffect(() => {
    if (hoveredMedicine == "") {
      return;
    }

    const fetchLocations = async () => {
      setFindLocationsLoading(true);
      setFindLocationsError(false);
      try {
        const response = await fetch(
          `http://localhost:4000/api/getpharmaciesbymedicine?medicineName=${encodeURIComponent(
            hoveredMedicine
          )}`
        );
        if (!response.ok) {
          setFindLocationsError(true);
          throw new Error(`HTTP error! status: ${response.status}`); //if we actually do this in the final product imma punch yall but for testing this is fine ig
        }
        const data = await response.json();
        const data_transformed = data.map((pharmacy: Location) => ({
          address: pharmacy.address,
          city: pharmacy.city,
          state: pharmacy.state,
        }));
        setLocations(data_transformed);
      } catch (err) {
        console.error("Error fetching pharmacies:", err);
        setFindLocationsError(true);
      } finally {
        setFindLocationsLoading(false);
      }
    };

    fetchLocations();
  }, [hoveredMedicine]);

  /*const medicines = [
    { name: "med1", price: 10, score: 8 },
    { name: "med2", price: 20, score: 6 },
    { name: "med3", price: 15, score: 9 },
  ];*/

  const handleChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setNextSymptom(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    if (nextSymptom == "") {
      return;
    }
    event.preventDefault();
    setSymptoms((prev) => [...prev, nextSymptom]);
  };

  const getMedicines = async () => {
    setFindMedicineLoading(true);
    setFindMedicineError(false);
    try {
      const response = await fetch(
        `http://localhost:4000/api/getmedicinesbysymptoms?symptom=${encodeURIComponent(
          "Diarrhea"
        )}` //change path to env variable later, doing this cuz its 1030 and im tired. also dont hardcode diarrhea
      );
      if (!response.ok) {
        setFindMedicineError(true);
        throw new Error(`HTTP error! status: ${response.status}`); //if we actually do this in the final product imma punch yall but for testing this is fine ig
      }
      const data = await response.json();
      console.log(data);
      const data_transformed = data.map((med: MedicineRaw) => ({
        name: med.medicine_name,
        rating: Number(med.medicine_rating),
        symptoms_treated: Number(med.symptoms_treated),
      }));
      console.log(data_transformed);
      setMedicines(data_transformed);
    } catch (err) {
      setFindMedicineError(true);
      console.error("Error fetching medicines:", err);
    } finally {
      setFindMedicineLoading(false);
    }
  };

  return (
    <>
      <h1>Welcome to App name!</h1>
      <h2>Current Symptoms</h2>
      <ul>
        {symptoms.map((symptom) => (
          <li>{symptom}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <label>
          Symptom:
          <input
            type="text"
            id="symptom"
            name="symptom"
            placeholder="current symptom"
            onChange={handleChange}
          ></input>
        </label>
        <button type="submit">Submit</button>
      </form>

      <button onClick={getMedicines}>Find medicine for these symptoms</button>

      <h2>Suggested Medicines</h2>

      {findMedicineError ? (
        <p>There was an error loading your medicines. Please try again </p>
      ) : findMedicineLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {medicines.map((medicine) => (
            <li
              key={medicine.name}
              onMouseEnter={() => setHoveredMedicine(medicine.name)}
              onMouseLeave={() => setHoveredMedicine("")}
            >
              <p>
                {medicine.name}, {medicine.rating}, {medicine.symptoms_treated}
              </p>
              {hoveredMedicine == medicine.name && (
                <div>
                  {findLocationsError ? (
                    <p>
                      There was an error loading the locations this medicine is
                      carried. Please try again{" "}
                    </p>
                  ) : findLocationsLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <ul>
                      {locations.map((location) => (
                        <div>
                          {location.address}, {location.city}, {location.state}
                        </div>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;
