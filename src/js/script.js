const url = "https://raw.githubusercontent.com/flaviamoa/CTU-13/main/full_capture20110818_preprocessed_flavia.csv";


fetch(url)
.then(resposta => resposta.text())
.then(data => {

data = data.split("\n")
data = data.map(i=>i.split(","))

const frequencyCounter = {};

const dataToProcess = data.slice(1);


dataToProcess.forEach(entry => {
	const ip = entry[2];

	if (!frequencyCounter[ip]) {
	  frequencyCounter[ip] = 0;
	}

	frequencyCounter[ip]++;
});

// Converter o objeto para uma matriz de pares chave-valor
let entries = Object.entries(frequencyCounter);

// Ordenar a matriz com base no valor (frequência)
entries.sort((a, b) => b[1] - a[1]);

let top10 = data //.filter(i=>i[3] == '10')

let moreThan150 = entries.filter(i=>i[1] >= 150)

// local
const local  = document.querySelector("#meu-grafico1")

	let dados = {
		//rotulos
		labels: entries.map(i => i[0]), //["IP", "Count"], //top10.map(i=>i[4]),
		datasets: [
			{
				label: "IP source",
				data: entries, //top10.map(i=>i[4]),
				borderWidth: 1,
				borderColor: "#1E90FF",
				backgroundColor: "#1E90FF"
			}
			
		]
	};

	let dados2 = {
		//rotulos
		labels: moreThan150.map(i => i[0]), //["IP", "Count"], //top10.map(i=>i[4]),
		datasets: [
			{
				label: "IP source",
				data: moreThan150, //top10.map(i=>i[4]),
				borderWidth: 1,
				borderColor: "#1E90FF",
				backgroundColor: "#1E90FF"
			}
		]
	};

	new Chart(local, {
		type: "bar",
		data: dados,
		options:{
			scales:{
				y:{
					display: true,
					type: 'logarithmic'
				}
			}
		}
	})

	const local2  = document.querySelector("#meu-grafico2")

	new Chart(local2, {
		type: "bar",
		data: dados2,
		options:{
			scales:{
				y:{
					display: true,
					type: 'logarithmic',
					beginAtZero: true
				}
			}
		}
	})

}).catch(error => {
    console.error('Erro ao buscar o arquivo:', error);
});
