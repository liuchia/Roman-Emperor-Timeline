var colors = {
	["Julio-Claudian"]: "#EF3131",
	["Year of the Four Emperors"]: "#888888",
	["Flavian Dynasty"]: "#31EF31",
	["Nerva-Antonine Dynasty"]: "#3131EF",
	["Year of the Five Emperors"]: "#888888",
	["Severan Dynasty"]: "#ADAD31",
	["Crisis of the Third Century"]: "#888888",
	["Tetrachy"]: "#AD31AD",
	["Constantinian Dynasty"]: "#31ADAD",
	["Valentinian Dynasty"]: "#B88B31",
	["Theodosian Dynasty"]: "#31B88B",
	["End of the West"]: "#888888",
	["Leonid Dynasty"]: "#8B31B8",
	["Justinian Dynasty"]: "#7f14bc",
	["Heraclian Dynasty"]: "#ce6012",
	["Twenty Years' Anarchy"]: "#888888",
	["Isaurian Dynasty"]: "#EF3131",
	["Nikephorian Dynasty"]: "#31EF31",
	["Amorian Dynasty"]: "#3131EF",
	["Macedonian Dynasty"]: "#dba643",
	["Doukid Dynasty"]: "#AD31AD",
	["Komnenid Dynasty"]: "#31ADAD",
	["Angelid Dynasty"]: "#edc0dc",
	["Laskarid Dynasty"]: "#888888",
	["Palaiologan Dynasty"]: "#31B88B",
	[" "]: "#888888"
};

d3.csv("./data.csv", function(data) {
	var hgap = 25;
	var vgap = 20;
	var hmargin = 25;
	var vmid = 125;
	var radius = 10;
	var firstyear = +data[0].START;
	var lastyear = +data[data.length-1].END;
	var offset = firstyear < 0 ? -firstyear : 0;

	var svg = d3.select("#container").append("svg");
	var xscroll = 0;
	var dragpos = 0;
	var tempscroll = 0;
	var prevtemp = 0;
	var dragging = false, active = false;
	var xvel = 0;

	var mousex = 0;

	var background = svg.append("g")
		.attr("x", 0).attr("y", 0)
		.attr("width", "100%").attr("height", "100%")
	var timeaxis = background.append("g")
		.attr("x", 0).attr("y", 0)
		.attr("width", "100%").attr("height", "100%")
	var lineofemp = {};
	var emplines = background.append("g")
		.attr("x", 0).attr("y", 0)
		.attr("width", "100%").attr("height", "100%")

	var arrows = [], name_tips = [], dynas_tips = [];
	var tooltip = svg.append("g")
		.attr("x", 0).attr("y", 0)
		.attr("width", "100%").attr("height", "100%")

	d3.timer(function(elapsed) {
		xvel *= 0.95; // decelerate over time
		xscroll += xvel;
		var rightlimit = screen.width - hmargin*2 - (lastyear+offset) * hgap;
		if (xscroll > 0 || xscroll < rightlimit) { // bounce off walls
			xvel *= -0.5;
			xscroll = xscroll > 0 ? 0 : rightlimit;
		}
		background.attr("transform", "translate("+Math.min(0, Math.max(xscroll + tempscroll, screen.width - hmargin*2 - (lastyear+offset) * hgap))+", 0)");
	})

	svg.call(d3.drag() // drag svg to move
		.on("start", function(d) {
			dragging = true;
			dragpos = d3.event.x;
			prevtemp = tempscroll;
		})
		.on("end", function(d) {
			dragging = false;
			xscroll += tempscroll;
			xscroll = Math.min(0, Math.max(screen.width - hmargin*2 - (lastyear+offset) * hgap, xscroll));

			if (Math.abs(tempscroll - prevtemp) > 5) // continue sliding if mouse movement before drag ended is large enough
				xvel += (tempscroll - prevtemp)*2;
			tempscroll = 0;
		})
		.on("drag", function(d) {
			prevtemp = tempscroll;
			tempscroll = d3.event.x - dragpos;
			background.attr("transform", "translate("+Math.min(0, Math.max(xscroll+tempscroll, screen.width - hmargin*2 - (lastyear+offset) * hgap))+", 0)");
		})
	)

	svg.on("mousemove", function() {
		mousex = d3.mouse(this)[0];
	})
	.on("mouseenter", function() {
		active = true;
	})
	.on("mouseleave", function() {
		active = false;
	})

	var metro = new Array();
	for (var i = firstyear+offset; i <= lastyear+offset; i++)
		metro.push([]);

	for (var i = 0; i < data.length; i++) {
		var emperor = data[i];
		emperor.START = +emperor.START;
		emperor.END = +emperor.END;
		for (var j = emperor.START+offset; j <= emperor.END+offset; j++)
			metro[j].push(emperor);
		emperor.DEATH = emperor.DEATH.split("-");
	}

	for (var i = -20; i < lastyear; i += 10) {
		var x = hmargin + hgap * (i+offset);
		timeaxis.append("line")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", vmid + 100 - 20)
			.attr("y2", vmid + 100 - 10)
			.attr("stroke", "#313131")
			.attr("stroke-width", 1)
		timeaxis.append("text")
			.attr("x", x)
			.attr("y", vmid + 100)
			.attr("font-size", "10px")
			.attr("fill", "#313131")
			.attr("text-anchor", "middle")
			.html(i <= 0 ? (-i + 1) + "BC" : i + "AD")
	}

	var x = emplines.selectAll().data(data).enter()
		.append("polyline")
		.attr("points", function(emp) {
			var points = "";
			for (var k = emp.START+offset; k < emp.END+offset+1; k++) {
				var x = hmargin + hgap * k;
				var y = vmid - vgap/2*(metro[k].length-1)+vgap*metro[k].indexOf(emp);
				points += x + "," + y + " ";
			}
			return points;
		})
		.attr("fill", "none")
		.attr("stroke", function(emp) {return colors[emp.DYNASTY]})
		.attr("stroke-width", radius/2)//radius*2 - 2)
		.attr("id", function(emp) {return emp.NAME.split(' ').join('_')})

	emplines.selectAll().data(data.filter(function(emp) {return emp.START != emp.END})).enter()
		.append("circle")
		.attr("cx", function(emp) {return hmargin + hgap * (emp.START+offset)})
		.attr("cy", function(emp) {return vmid - vgap/2*(metro[emp.START+offset].length-1) + vgap*metro[emp.START+offset].indexOf(emp)})
		.attr("r", radius/2)
		.attr("fill", function(emp) {return colors[emp.DYNASTY]})
		.attr("stroke", "#313131")
		.attr("stroke-width", 2)
		.attr("id", function(emp) {return "Head"+emp.NAME.split(' ').join('_')})

	emplines.selectAll().data(data).enter()
		.append("circle")
		.attr("cx", function(emp) {return hmargin + hgap * (emp.END+offset)})
		.attr("cy", function(emp) {return vmid - vgap/2*(metro[emp.END+offset].length-1) + vgap*metro[emp.END+offset].indexOf(emp)})
		.attr("r", radius/2)
		.attr("fill", function(emp) {return colors[emp.DYNASTY]})
		.attr("stroke", "#313131")
		.attr("stroke-width", 2)
		.attr("id", function(emp) {return "Tail"+emp.NAME.split(' ').join('_')})

	for (var i = 0; i < 6; i++) {
		var arrow = tooltip.append("polygon")
			.attr("points", "0,0 9,-9 175,-9 175,9 9,9")
			.attr("stroke-width", 0)
			.attr("fill", "#313131")
		var namen = tooltip.append("text")
			.attr("x", 18)
			.attr("y", 4)
			.attr("font-size", "14px")
			.attr("fill", "#FFFFFF")
			.attr("text-anchor", "left")
			.attr("font-weight", 550)
		var dynas = tooltip.append("text")
			.attr("x", 18)
			.attr("y", 4)
			.attr("font-size", "14px")
			.attr("fill", "#FFFFFF")
			.attr("text-anchor", "left")
			.attr("font-weight", 200)
		arrows.push(arrow);
		name_tips.push(namen);
		dynas_tips.push(dynas);
	}

	d3.timer(function(elapsed) {
		// scroll drag
		xvel *= 0.95; // decelerate over time
		xscroll += xvel;
		var rightlimit = screen.width - hmargin*2 - (lastyear+offset) * hgap;
		if (xscroll > 0 || xscroll < rightlimit) { // bounce off walls
			xvel *= -0.5;
			xscroll = xscroll > 0 ? 0 : rightlimit;
		}
		background.attr("transform", "translate("+Math.min(0, Math.max(xscroll + tempscroll, screen.width - hmargin*2 - (lastyear+offset) * hgap))+", 0)");
	
		// tooltips
		var truex = mousex - xscroll - hmargin;
		var year = Math.floor(truex / hgap - offset + 0.5);
		year = year < firstyear ? firstyear : year;
		year = year > lastyear ? lastyear : year;

		var falsex = mousex + tempscroll - hmargin;
		var fyear = falsex / hgap - offset;
		
		var emparray = metro[year+offset];
		for (var i = 0; i < 6; i++) {
			if (i < emparray.length && active) {
				var x = hmargin + hgap * (fyear+offset);
				var y = vmid - vgap/2*(emparray.length-1)+vgap*i;
				arrows[i].attr("transform", "translate("+x+", "+y+")")
					.attr("visibility", "visible")
				name_tips[i].attr("transform", "translate("+x+", "+y+")")
					.attr("visibility", "visible")
					.html(emparray[i].NAME)
				var textlen = name_tips[i].node().getComputedTextLength();
				dynas_tips[i].attr("transform", "translate("+x+", "+y+")")
					.attr("x", 45 + textlen)
					.attr("visibility", "visible")
					.attr("fill", colors[emparray[i].DYNASTY])
					.html(emparray[i].DYNASTY)
				textlen += dynas_tips[i].node().getComputedTextLength();
				arrows[i].attr("points", "0,0 9,-9 "+(textlen+80)+",-9 "+(textlen+80)+",9 9,9")
			} else {
				arrows[i].attr("visibility", "hidden");
				name_tips[i].attr("visibility", "hidden");
				dynas_tips[i].attr("visibility", "hidden");
			}
		}
	})

	var fatefilter = document.getElementById("fatefilter");
	fatefilter.onchange = function() {
		for (var i = 0; i < data.length; i++) {
			emp = data[i];
			var pline_id = emp.NAME.split(' ').join('_');
			var pline = emplines.select("#"+pline_id);
			var head = emplines.select("#Head"+pline_id);
			var tail = emplines.select("#Tail"+pline_id);
			if (fatefilter.value == "No Filter" || emp.DEATH.includes(fatefilter.value)) {
				pline.attr("stroke", function(emp) {return colors[emp.DYNASTY]})
				head.attr("fill", function(emp) {return colors[emp.DYNASTY]})
				tail.attr("fill", function(emp) {return colors[emp.DYNASTY]})
			} else {
				pline.attr("stroke", "#EEEEEE")
				head.attr("fill", "#EEEEEE")
				tail.attr("fill", "#EEEEEE")
			}
		}
	}
})
