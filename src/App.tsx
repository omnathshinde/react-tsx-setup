function App() {
	const api = import.meta.env.VITE_API_URL;
	const env = import.meta.env.VITE_ENV;

	return (
		<div className="h-screen flex flex-col items-center justify-center">
			<h1 className="bg-red-100">Hello World</h1>
			<p>API - {api}</p>
			<p>env - {env}</p>
		</div>
	);
}

export default App;
