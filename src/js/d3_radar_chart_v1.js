// URL do CSV
const csvUrl = "https://raw.githubusercontent.com/flaviamoa/CTU-13/main/full_capture20110818_preprocessed_flavia.csv";

// Função para carregar e processar os dados
async function loadData() {
    const data = await d3.csv(csvUrl);
    
    // Converter frame_len e tcp.time_delta para números
    data.forEach(d => {
        d['frame_len'] = +d['frame_len'];
        d['tcp_time_delta'] = +d['tcp_time_delta'];
    });

    // Encontrar os 3 IPs de origem com o maior número de entradas
    const ipCounts = d3.rollup(data, v => v.length, d => d['ip_src']);
    const topIps = Array.from(ipCounts.entries())
                        .sort((a, b) => d3.descending(a[1], b[1]))
                        .slice(0, 3)
                        .map(d => d[0]);

    // Filtrar os dados para os 3 IPs principais
    const filteredData = data.filter(d => topIps.includes(d['ip_src']));
    
    return { filteredData, topIps };
}

// Função para criar o gráfico de radar
function createRadarChart(data, selector, ip) {
    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    // Crie um SVG para o gráfico
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

    // Adicione título
    svg.append("text")
        .attr("x", 0)
        .attr("y", -maxRadius - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Radar Chart for ${ip}`);

    // Adicione eixos
    const axis = svg.append("g").attr("class", "axis");
    axis.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", d => maxRadius * Math.cos(getAngle(d['ip_dst'])))
        .attr("y2", d => maxRadius * Math.sin(getAngle(d['ip_dst'])))
        .style("stroke", "#ddd");

    axis.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => (maxRadius + 10) * Math.cos(getAngle(d['ip_dst'])))
        .attr("y", d => (maxRadius + 10) * Math.sin(getAngle(d['ip_dst'])))
        .text(d => d['ip_dst'])
        .attr("font-size", "10px");

    // Adicione os raios
    const rays = svg.append("g").attr("class", "rays");
    rays.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", d => (maxRadius * d['frame_len'] / getMaxFrameLen(data)) * Math.cos(getAngle(d['ip_dst'])))
        .attr("y2", d => (maxRadius * d['frame_len'] / getMaxFrameLen(data)) * Math.sin(getAngle(d['ip_dst'])))
        .style("stroke", "#1f77b4")
        .style("stroke-width", 2);
}

// Função para calcular o ângulo baseado no IP de destino
function getAngle(ip) {
    if (!ip) {
        return 0; // Retorna 0 para IPs malformados ou ausentes
    }
    const parts = ip.split('.').map(d => +d);
    if (parts.length !== 4 || parts.some(isNaN)) {
        return 0;  // Retorna 0 para IPs malformados
    }
    const total = parts.reduce((acc, val) => acc + val, 0);
    return (total % 360) * (Math.PI / 180);
}

// Função para obter o comprimento máximo do quadro
function getMaxFrameLen(data) {
    return d3.max(data, d => d['frame_len']);
}

// Carregar os dados e criar os gráficos
loadData().then(({ filteredData, topIps }) => {
    topIps.forEach((ip, index) => {
        const ipData = filteredData.filter(d => d['ip_src'] === ip);
        createRadarChart(ipData, `#radar-chart-${index + 1}`, ip);
    });
}).catch(error => {
    console.error('Error loading or processing data:', error);
});

console.log("The End")