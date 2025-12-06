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
  const [userEmail, setUserEmail] = useState("");

  const [curEmailInput, setCurEmailInput] = useState("");

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // signup form states
  const [signupEmail, setSignupEmail] = useState("");
  const [signupState, setSignupState] = useState("");
  const [signupCity, setSignupCity] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPharmacy, setSignupPharmacy] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

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

  const handleChangeEmail = (event: {
    target: {value: SetStateAction<string> };
  }) => {
    setCurEmailInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    if (nextSymptom == "") {
      return;
    }
    event.preventDefault();
    setSymptoms((prev) => [...prev, nextSymptom]);
    addSymptom(userEmail, nextSymptom);
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

  const addSymptom = async (email: string, symptom: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/removesymptom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          symptom: symptom,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add symptom");
      }

      return data;
    } catch (error) {
      console.error("Error adding symptom:", error);
    }
  };

  const removeSymptom = async (email: string, symptom: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/removesymptom", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          symptom: symptom,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete symptom");
      }

      return data;
    } catch (error) {
      console.error("Error deleting symptom:", error);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    setSignupSuccess(false);

    try {
      const response = await fetch("http://localhost:4000/api/adduser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupEmail,
          state: signupState,
          city: signupCity,
          address: signupAddress,
          preferredPharmacy: signupPharmacy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      setUserEmail(signupEmail);
      setSignupSuccess(true);
      setSignupEmail("");
      setSignupState("");
      setSignupCity("");
      setSignupAddress("");
      setSignupPharmacy("");
    } catch (error) {
      console.error("Error signing up:", error);
      setSignupError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <>
      <h1>Welcome to App name!</h1>
      <h2>Login</h2>
      {/* currently we are not checking if the email exists in the db. we should probably do that but i am lazy */}
      <form onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        setUserEmail(curEmailInput);
      }}>
        <label>Email:</label>
        <input type="text" id="email" name="email" placeholder="your email" onChange={handleChangeEmail}></input>
        <button type="submit">Submit</button>
      </form>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <label>
          Email:
          <input
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            placeholder="your email"
            required
          />
        </label>
        <br />
        <label>
          State:
          <input
            type="text"
            value={signupState}
            onChange={(e) => setSignupState(e.target.value)}
            placeholder="state"
            required
          />
        </label>
        <br />
        <label>
          City:
          <input
            type="text"
            value={signupCity}
            onChange={(e) => setSignupCity(e.target.value)}
            placeholder="city"
            required
          />
        </label>
        <br />
        <label>
          Address:
          <input
            type="text"
            value={signupAddress}
            onChange={(e) => setSignupAddress(e.target.value)}
            placeholder="street address"
            required
          />
        </label>
        <br />
        <label>
          Preferred Pharmacy:
          <input
            type="text"
            value={signupPharmacy}
            onChange={(e) => setSignupPharmacy(e.target.value)}
            placeholder="pharmacy name"
            required
          />
        </label>
        <br />
        <button type="submit" disabled={signupLoading}>
          {signupLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {signupSuccess && <p style={{ color: "green" }}>Signup successful!</p>}
      {signupError && <p style={{ color: "red" }}>Error: {signupError}</p>}
      
      <h2>Current Symptoms</h2>
      <ul>
        {symptoms.map((cSymptom) => (
          <li>
            {cSymptom}
            <button
              onClick={() => {
                removeSymptom(userEmail, cSymptom);
                setSymptoms((prevSymptoms) =>
                  prevSymptoms.filter((symptom) => symptom !== cSymptom)
                );
              }}
            >
              Remove Symptom
            </button>
          </li>
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
