import SplitText from "./components/SplitText";

export default function App() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <SplitText
        text="Nimble Gravity"
        className="text-white text-5xl font-bold"
      />
    </div>
  );
}