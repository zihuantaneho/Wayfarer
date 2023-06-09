import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const WIDTH = 200;
const HEIGHT = 318;

export const BarChart = ({ value1: _value1, value2: _value2, label1, label2, title, shouldMapValues }) => {
  const value1 = _value1.replace(",", "");
  const value2 = _value2.replace(",", "");

  const chartRef = useRef(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");

    const svg = d3.select(chartRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = WIDTH - margin.left - margin.right;
    const PADDING_TOP = 20
    const height = HEIGHT - margin.top - margin.bottom - PADDING_TOP;

    svg.selectAll('*').remove(); // Clear any existing chart

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const max = Math.max(value1, value2);

    const data = [
      { label: label1, value: shouldMapValues ? value1 / max * 100 : value1 },
      { label: label2, value: shouldMapValues ? value2 / max * 100 : value2 },
    ];

    x.domain(data.map((d) => d.label));
    y.domain([0, shouldMapValues ? 100 : max * 1.3]);

    chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.label))
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d.value) + PADDING_TOP)
      .attr('height', (d) => height - y(d.value))
      .attr('fill', 'rgb(59, 130, 246)');

    chart
      .append('g')
      .attr('color', isDarkMode ? 'white' : "black")
      .attr('transform', `translate(0,${height + PADDING_TOP})`)
      .call(d3.axisBottom(x));

    chart.append('g')
      .attr('color', isDarkMode ? 'white' : "black")
      .attr('transform', `translate(0,${PADDING_TOP})`).call(d3.axisLeft(y));

    // Add chart title
    svg
      .append('text')
      .attr('x', width / 2 + margin.left)
      .attr('fill', isDarkMode ? 'white' : "black")
      .attr('y', margin.top / 2 + 12)
      .attr('text-anchor', 'middle')
      .text(title);
  }, [value1, value2, title]);

  return (
      <svg
        ref={chartRef}
        className="bg-white dark:bg-gray-800 border-gray-400 border dark:border-gray-500 rounded-md"
        width={WIDTH}
        height={HEIGHT}
      ></svg>
  );
};
