import { useEffect, useState, type SetStateAction } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

interface Medicine {
  name: string;
  price: number;
  score: number;
  //can add more things in the final product
}

function App() {

  const [nextSymptom, setNextSymptom] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [hoveredMedicine, setHoveredMedicine] = useState("");

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  //api specific states
  const [findMedicineError, setFindMedicineError] = useState(false);
  const [findMedicineLoading, setFindMedicineLoading] = useState(false);

  const [findLocationsError, setFindLocationsError] = useState(false);
  const [findLocationsLoading, setFindLocationsLoading] = useState(false);

  useEffect(() => {
  if (hoveredMedicine == ""){
    return;
  }

  const fetchLocations = async () => {
    // replace with real API call later
    const data = ["location1", "location2", "location3"];
    setLocations(data);
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

  const getMedicines = () => {
    setMedicines([
      { name: "med1", price: 10, score: 8 },
      { name: "med2", price: 20, score: 6 },
      { name: "med3", price: 15, score: 9 },
    ]);

    //temp placeholder until we get api routes in order
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
              onMouseEnter={() => setHoveredMedicine(medicine.name)}
              onMouseLeave={() => setHoveredMedicine("")}
            >
              <p>
                {medicine.name}, {medicine.price}, {medicine.score}
              </p>
              {hoveredMedicine == medicine.name && (
                <div>{findLocationsError ? (<p>There was an error loading the locations this medicine is carried. Please try again </p>): (
                  findLocationsLoading ? (<p>Loading...</p>) : (
                    <ul>
                      {locations.map((location) => (
                        <div>{location}</div>
                      ))}
                    </ul>
                  )
                )}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;
