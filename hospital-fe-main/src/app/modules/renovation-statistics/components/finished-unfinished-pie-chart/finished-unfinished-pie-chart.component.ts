import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
//import { legendColor } from "d3-svg-legend";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-finished-unfinished-pie-chart',
  templateUrl: './finished-unfinished-pie-chart.component.html',
  styleUrls: ['./finished-unfinished-pie-chart.component.css']
})
export class FinishedUnfinishedPieChartComponent implements OnInit {
  @Input() importData : Observable<number[]> = new Observable<number[]>;
  clearData : number[] = []
   
  constructor() { }

  ngOnInit(): void {
    this.importData.subscribe({
      next : (v) => {
        this.clearData = v;
        const svgDimensions = { width: 390, height: 500 };
        const margin = { left: 5, right: 5, top: 10, bottom: 10 };
        const chartDimensions = {
          width: svgDimensions.width - margin.left - margin.right,
          height: svgDimensions.height-100 - margin.bottom - margin.top
        };
    
        const keys: string[] = [
          "Finished",
          "Unfinished"
        ];

        const colors = [
          "#ED1D25",
          "#0056A8",
          "#5BC035",
          "#6B2E68",
          "#F3B219",
          "#FA5000",
          "#C50048",
          "#029626",
          "#A3C940",
          "#0DDEC5",
          "#FFF203",
          "#FFDB1B",
          "#E61C13",
          "#73B1E6",
          "#BECD48",
          "#017252"
        ];

        var ordinal = d3
        .scaleOrdinal()
        .domain(keys)
        .range(colors);

        d3.select("#my_dataviz").selectChildren().remove();

        const svg = d3
          .select("#my_dataviz")
          .append("svg")
          .attr("width", svgDimensions.width)
          .attr("height", svgDimensions.height)
        
        const chartGroup = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .attr("width", chartDimensions.width)
          .attr("height", chartDimensions.height)
      
        const radius = Math.min(chartDimensions.width, chartDimensions.height) / 2;

        chartGroup.attr("transform", `translate(${radius},${radius})`);
        const arc = d3
          .arc()
          .innerRadius(radius / 1.7) // We want to have an arc with a propotional width
          .outerRadius(radius);
        
        const pieChart = d3
          .pie()
          .startAngle(0 * (Math.PI / 180))
          .endAngle(360 * (Math.PI / 180))
          
        
        const data = this.clearData;

        const pie = pieChart(data);

        const arcs = chartGroup
          .selectAll("slice")
          .data(pie)
          .enter();

        arcs
          .append("path")
          .attr("d", <any>arc) // Hack typing: https://stackoverflow.com/questions/35413072/compilation-errors-when-drawing-a-piechart-using-d3-js-typescript-and-angular/38021825
          .attr("fill", (d, i) => colors[i]); // TODO color ordinal

        //var legendOrdinal = legendColor().scale(ordinal);

        const legendLeft = margin.left;
        const legendTop = radius*2 + 10;
        
        const legendGroup = svg
          .append("g")
          .attr("transform", `translate(${legendLeft},${legendTop})`);
        
        //legendGroup.call(<any>legendOrdinal);
          }
        })

  }
  
}
