import * as d3 from 'd3';
import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../shared/services/weather-service';

@Component({
  selector: 'app-weather-summary',
  templateUrl: './weather-summary.component.html',
  styleUrls: ['./weather-summary.component.css'],
  providers: [ WeatherService ]
})
export class WeatherSummaryComponent implements OnInit {
  gotTrailingResponse: boolean = false;
  gotHighsLowsResponse: boolean = false;
  currentTemp: number;
  trailingTemps: number[];
  description: string;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.weatherService.getTrailingTemps().subscribe((data: any[]) => {
      this.gotTrailingResponse = true;
      this.description = data[0].description;
      this.currentTemp = data[0].temperature;
      this.createLineGraph(data);
    });
    this.weatherService.getHighsLows().subscribe((data: any[]) => {
      this.gotHighsLowsResponse = true;
      this.createBars(data);
    });
  }

  createLineGraph(data) {
    let margin = {top: 25, right: 15, bottom: 20, left: 15};
    let width = 320 - margin.left - margin.right;
    let height = 200 - margin.top - margin.bottom;
    let svg = d3.select('#trailingTempsLine')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    let x = d3.scaleLinear().domain([12, 0]).range([0, width]);
    let y = d3.scaleLinear()
        .domain([this.getMinTemp(data), this.getMaxTemp(data)])
        .range([height, 0]);
    let line = d3.line()
        .x(function(d, i) {return x(i);})
        .y(function(d) {return y(d.temperature);})
        .curve(d3.curveMonotoneX);

    svg.append('g')
        .append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', '#ffab00')
        .attr('stroke-width', '3')
        .attr('d', line);

    svg.append('g')
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', function(d, i) {
            return x(i) - 10;
        })
        .attr('y', function(d) {
            return y(d.temperature) - 10;
        })
        .attr('fill', '#ffab00')
        .attr('font-size', '14px')
        .text(function(d) {
            return d.temperature;
        });

    let tickData = this.getTickValues(data);
    let xAxis = d3.axisBottom()
        .scale(x)
        .tickSize(0)
        .tickValues(tickData[0])
        .tickFormat(function(d, i) { return tickData[1][i] });

    let g = svg.append('g');

    g.attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .call(g => g.select('.domain').remove());
  }

  getMinTemp(data) {
    return data.reduce((min, p) => p.temperature < min ? p.temperature : min, data[0].temperature);
  }

  getMaxTemp(data) {
    return data.reduce((max, p) => p.temperature > max ? p.temperature : max, data[0].temperature);
  }

  getTickValues(data) {
    let tickValues = [];
    let tickLabels = [];
    for (let i = 0; i < data.length; i++) {
      if (i % 3 == 0) {
        tickValues.push(i);
        tickLabels.push(data[i]._col0);
      }
    }
    return [tickValues, tickLabels];
  }

  createBars(data) {
    let margin = {top: 20, right: 5, bottom: 20, left: 5};
    let width = 420 - margin.left - margin.right;
    let height = 200 - margin.top - margin.bottom;
    let svg = d3.select('#highsLowsBar')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 80]);

    const xScale = d3.scaleBand()
        .range([width, 0])
        .domain(data.map((d, i) => d.day))
        .padding(0.2);

    const xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(0);

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .call(g => g.select('.domain').remove());

    let bars = svg.selectAll()
        .data(data)
        .enter()
        .append('g');

    bars.append('rect')
        .attr('x', (d) => xScale(d.day))
        .attr('y', (d) => yScale(d.high))
        .attr('id', (d, i) => `bar-${i}`)
        .attr('height', (d) => height - yScale(d.high))
        .attr('width', xScale.bandwidth())
        .attr('fill', '#ffab00')
        .on('mouseover', (d, i) => {
          d3.select(`#bar-${i}`).attr('fill', '#3f52b5');
        })
        .on('mouseout', (d, i) => {
          d3.select(`#bar-${i}`).attr('fill', '#ffab00');
        });

    bars.append('text')
        .attr('x', (d) => xScale(d.day) + (xScale.bandwidth() / 2))
        .attr('y', (d) => yScale(d.high) - 5)
        .attr('fill', '#ffab00')
        .attr('font-size', '14px')
        .attr('text-anchor', 'middle')
        .text((d) => d.high);

  }

}
