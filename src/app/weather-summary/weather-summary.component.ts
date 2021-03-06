import * as d3 from 'd3';
import {Component, OnInit} from '@angular/core';
import {forkJoin} from 'rxjs';

import {WeatherService} from '../shared/services/weather-service';


@Component({
  selector: 'app-weather-summary',
  templateUrl: './weather-summary.component.html',
  styleUrls: ['./weather-summary.component.css'],
  providers: [WeatherService],
})
export class WeatherSummaryComponent implements OnInit {
  gotTrailingResponse = false;
  gotHighsLowsResponse = false;
  currentTemp: number;
  trailingTemps: number[];
  description: string;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    forkJoin(
        this.weatherService.getTrailingTemps(),
        this.weatherService.getHighsLows(),
    ).subscribe((data: any) => {
      this.gotTrailingResponse = true;
      this.description = data[0][0].description;
      this.currentTemp = data[0][0].temperature;
      this.createLineGraph(data[0]);
      this.gotHighsLowsResponse = true;
      this.createBars(data[1]);
    });
  }

  createLineGraph(data: any) {
    const margin = {top: 25, right: 15, bottom: 20, left: 15};
    const width = 320 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    const svg = d3.select('#trailingTempsLine')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const x = d3.scaleLinear().domain([12, 0]).range([0, width]);
    const y = d3.scaleLinear()
        .domain([this.getMinTemp(data), this.getMaxTemp(data)])
        .range([height, 0]);
    const line = d3.line()
        .x((_d, i) => x(i))
        .y((d: any) => y(d.temperature))
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
        .attr('x', (_d, i) => {
          return x(i) - 10;
        })
        .attr('y', (d: any) => {
          return y(d.temperature) - 10;
        })
        .attr('fill', '#ffab00')
        .attr('font-size', '14px')
        .text((d: any) => {
          return d.temperature;
        });

    const tickData = this.getTickValues(data);
    const xAxis = d3.axisBottom(null)
        .scale(x)
        .tickSize(0)
        .tickValues(tickData[0])
        .tickFormat((_d, i) => tickData[1][i]);

    const g = svg.append('g');

    g.attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .call((gr) => gr.select('.domain').remove());
  }

  getMinTemp(data: any) {
    return data.reduce((min: any, p: any) => p.temperature < min ?
      p.temperature : min, data[0].temperature);
  }

  getMaxTemp(data: any) {
    return data.reduce((max: any, p: any) => p.temperature > max ?
      p.temperature : max, data[0].temperature);
  }

  getTickValues(data: any) {
    const tickValues = [];
    const tickLabels = [];
    for (let i = 0; i < data.length; i++) {
      if (i % 3 === 0) {
        tickValues.push(i);
        tickLabels.push(data[i]._col0);
      }
    }
    return [tickValues, tickLabels];
  }

  createBars(data: any) {
    const margin = {top: 20, right: 5, bottom: 20, left: 5};
    const width = 420 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    const svg = d3.select('#highsLowsBar')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr(
            'transform',
            'translate(' + margin.left + ',' + margin.top + ')',
        );

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 80]);

    const xScale = d3.scaleBand()
        .range([width, 0])
        .domain(data.map((d: any) => d.day))
        .padding(0.2);

    const xAxis = d3
        .axisBottom(null)
        .scale(xScale)
        .tickSize(0);

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .call((g) => g.select('.domain').remove());

    const bars = svg.selectAll()
        .data(data)
        .enter()
        .append('g');

    bars.append('rect')
        .attr('x', (d: any) => xScale(d.day))
        .attr('y', (d: any) => yScale(d.high))
        .attr('id', (_d, i) => `bar-${i}`)
        .attr('height', (d: any) => height - yScale(d.high))
        .attr('width', xScale.bandwidth())
        .attr('fill', '#ffab00')
        .on('mouseover', (_d, i) => {
          d3.select(`#bar-${i}`).attr('fill', '#3f52b5');
        })
        .on('mouseout', (_d, i) => {
          d3.select(`#bar-${i}`).attr('fill', '#ffab00');
        });

    bars.append('text')
        .attr('x', (d: any) => xScale(d.day) + (xScale.bandwidth() / 2))
        .attr('y', (d: any) => yScale(d.high) - 5)
        .attr('fill', '#ffab00')
        .attr('font-size', '14px')
        .attr('text-anchor', 'middle')
        .text((d: any) => d.high);
  }
}
