<script>
	import InputField from "./InputField.svelte"

	let homeValue = 350000;
	let downpayment = 0;// homeValue * 0.05;
	let interestPercent = 2.5;
	let amortization = 25;
	let paymentFrequency = 12;
	
	// internal
	const paymentFrequencyOptions = [
		{value:12, title:"Monthly" },
		{value:24, title:"Semi-monthly" },
		{value:365.25 / 7 / 2, title:"Bi-weekly" },
		{value:365.25 / 7, title:"Weekly" },
	];
	let amortizationPayments = [];
	let amortizationRects = [];
	let payment = 0;
	let graphSelection = {
		style: {
			display: 'none'
		}
	}

	// computed
	$: interestRate = interestPercent / 100;
	$: principal = homeValue - downpayment;
	$: numPayments = amortization * paymentFrequency;
	$: interestPerPayment = interestRate / paymentFrequency;

	$: {
		let temp = Math.pow(1 + interestPerPayment, numPayments)
		payment = principal * interestPerPayment * temp / (temp - 1)

		var yearEndPrincipal = []
		var interestPortion, yearlyPrincipal
		var principalTemp = principal + 0;
		for (var y = 0; y < amortization; y++){
			for (var q = 0; q < paymentFrequency; q++){
				interestPortion = principalTemp * interestPerPayment // portion of payment paying down interest
				principalTemp = principalTemp - (payment - interestPortion)
			}
			principalTemp = principalTemp > 0 ? principalTemp : 0
			yearEndPrincipal.push({
				principal: principalTemp,
				interestPortion
			})
		}
		amortizationPayments = yearEndPrincipal;
		console.log(amortizationPayments)
	  amortizationRects = amortizationGraphBars(amortizationPayments, 500, 250)
	}
	
	$: totalCostOfMortgage = round2(payment * numPayments);
	$: interestPayed = round2(totalCostOfMortgage - principal);
	
	$: styleString = Object.entries(graphSelection.style)
  	.reduce((styleString, [propName, propValue]) => {
  		propName = propName.replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`);
    	return `${styleString}${propName}:${propValue};`;
  	}, '')
	
	// methods & utils

	function round(value, digits = 2) {
		return (value || 0).toFixed(digits)
	};
	function round2(value) {
		return (value || 0).toFixed(2)
	};
	function formatAsCurrency (value, dec = 2) {
		dec = dec || 0
		return '$ ' + (value | 0).toFixed(dec).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
	};
	function amortizationGraphBars (amortizationPayments, width, height) {
		let bars = []
		let spacing = 0
		let i, p, x, y, w, h
		for (i in amortizationPayments) {
			p = amortizationPayments[i].principal
			w = width/amortization - spacing
			x = parseInt(i) * (w + spacing) 
			w -= 1
			h = p * height/principal
			console.log(p, height, principal)
			h = h > 3 ? h : 3
			y = height - h

			bars.push({
				x: x,
				y: y,
				width: w,
				height: h,
				'data-p': p,
				'data-ip': amortizationPayments[i].interestPortion,
				'data-year': parseInt(i) + 1
			})
		}
		console.log(bars)
		return bars
	};
	function setHover (p, e) {
		graphSelection = {
			style: {
				left: e.clientX + 20 + 'px',
				top: e.clientY - 25 + 'px'
			},
			year: p['data-year'],
			principal: formatAsCurrency(p['data-p']),
			principalPercent: (p['data-p']/principal*100).toFixed(1) + "%",
			visible: true
		}
	}
	
</script>
<div id="app">
  <h2>Mortgage Calculator</h2>
  <div class="form">

		<div class="form-group">
			<label>Home Value: </label>
			<InputField bind:value={homeValue} type="dollar" decimals="0" step="1000"/>
		</div>
		<div class="form-group">
			<label>Down Payment: </label>
			<InputField bind:value={downpayment} type="dollar" decimals="0" step="1000"/>
		</div>
		<div class="form-group">
			<label>Interest Rate: </label>
			<InputField bind:value={interestPercent} type="percent" decimals="2" step="0.01"/>
		</div>
		<div class="form-group">
			<label>Amortization: </label>
			<InputField bind:value={amortization} type="years" decimals="0" step="1"/>
		</div>
		<div class="form-group">
			<label>Payment Frequency: </label>
			<InputField bind:value={paymentFrequency} type="option" options={paymentFrequencyOptions} decimals="0" step="100"/>
		</div>


		<div class="form-group">
			<label>Total cost of loan:</label>
			<span class="value">
				{formatAsCurrency(totalCostOfMortgage)}
			</span>
		</div>

		<div class="form-group">
			<label>Total Interest Paid:</label>
			<span class="value">
				{formatAsCurrency(interestPayed)}
			</span>
		</div>

		<div class="form-group">
			<label>Monthly Payment:</label>
			<span class="value out">
				{formatAsCurrency(payment)}
			</span>
		</div>

		<h3>Amortization Schedule</h3>
		<svg viewBox="0 0 560 300">

			<g class="xaxis">
				<line x1="0" y1="1" x2="500" y2="1"/>
				{#each amortizationPayments as a,index}
					<g>
						<line
									y1="0"
									y2={index % 5 === 0 ? 10 : 5}
									x1={index*500/(amortization)}
									x2={index*500/(amortization)}
						/>
						{#if index % (amortization < 55 ? 5 : 10) === 0}
							<text x={(index-0.4)*500/(amortization)} y={30}>{ index }</text>
						{/if}
					</g>
				{/each}
			</g>
			
			<g class="graph">
				{#each amortizationRects as p}
					<rect
						{...p}		
          	on:mousemove={e => setHover(p, e)}
          	on:mouseout={() => graphSelection.style.display = 'none'}
					></rect>
				{/each}
			</g>
		</svg>

	</div>
	
		{#if graphSelection !== null}
			<div class="hover" style={styleString}>
				Year: { graphSelection.year }<br/>
				Principal: { graphSelection.principal } <br/>
				Remaining: { graphSelection.principalPercent } <br/>
			</div>
		{/if}
</div>


<style >
	@import url("https://fonts.googleapis.com/css?family=Patua+One");

	#app {
		width: 500px;
		background: #2d5386;
		padding: 0;
		margin: 0 auto;
		top: 10px;
		position: relative;
		font-family: "Patua One", serif;
		color: #2d5386;
		border-radius: 4px;
		-moz-box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px;
		-webkit-box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px;
		box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px;
	}
	#app h2 {
		text-align: center;
		font-size: 32px;
		margin: 20px 0 20px 0;
		padding-top: 20px;
		color: #d9e3f0;
		text-shadow: rgba(0, 0, 0, 0.5) 2px 2px 10px;
	}
	#app h3 {
		text-align: center;
		font-size: 24px;
		margin: 16px 0 20px 0;
		color: #2d5386;
	}
	#app .form {
		margin: -30px 20px 20px 20px;
		display: block;
		background: #ffffff;
		padding: 18px;
		border-radius: 4px 4px 0 0;
		transform: translateY(30px);
		-moz-box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 18px;
		-webkit-box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 18px;
		box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 18px;
	}
	#app .form-group {
		width: 100%;
		position: relative;
		box-sizing: content-box;
		font-size: 18px;
		display: flex;
	}
	#app .form-group label {
		width: 49%;
		display: inline-block;
		text-align: right;
		box-sizing: content-box;
		line-height: 20px;
		padding: 10px;
	}
	#app .form-group .value {
		display: inline-block;
		text-align: right;
		box-sizing: content-box;
		line-height: 20px;
		padding: 10px 10px 10px 0;
	}
	#app .form-group .out {
		color: #000;
		font-size: 190%;
	}
	
	svg text {
		fill: #2d5386;
		font-family: "Mada", sans-serif;
	}
	svg line {
		stroke: #2d5386;
		stroke-width: 2px;
	}
	svg .xaxis {
		transform: translate(20px, 250px);
	}
	svg .graph {
		transform: translate(20px, 0px);
	}
	svg .graph rect {
		fill: #d9e3f0;
	}
	svg .graph rect:hover {
		fill: #2d5386;
	}
	svg .yaxis {
		transform: translate(20px, 0px) rotate(90deg);
	}

	.hover {
		position: fixed;
		display: block;
		padding: 8px;
		font-size: 16px;
		color: #2d5386;
		transition: all 0.1s;
		background: #ffffff;
		pointer-events: none;
		border: 1px solid #263238;
		-moz-box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px;
		-webkit-box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px;
		box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px;
	}
</style>