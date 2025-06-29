import "src/App.scss";

function App() {
	const api = import.meta.env.VITE_API_URL;
	const env = import.meta.env.VITE_ENV;

	return (
		<>
			<h1>Hello World</h1>
			<p>API - {api}</p>
			<p>env - {env}</p>
		</>
	);
}

export default App;
