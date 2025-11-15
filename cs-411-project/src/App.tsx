import { useState, type SetStateAction } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Medicine{
  name: string;
  price: number;
  score: number;
  //can add more things in the final product
}

function App() {

  const [nextSymptom, setNextSymptom] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  //const medicines;

  const handleChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setNextSymptom(event.target.value);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSymptoms(prev => [...prev, nextSymptom]);
  }

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
        <label>Symptom:
          <input type="text" id="symptom" name="symptom" placeholder="current symptom" onChange={handleChange}></input>
        </label>
        <button type="submit">Submit</button>
      </form>

      <button>Find medicine for these symptoms</button>
      <ul>
        {}
      </ul>
    </>
  )
}

export default App
