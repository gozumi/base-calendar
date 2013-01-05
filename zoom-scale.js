function ZoomScale() {
	this.scale = d3.scale.linear().domain([0,10]).range([0,10]);
	this.focus = 20;
	this.viewPort = 60;

	var focusFrontPercentage = Math.floor((100 - this.focus) / 2);
	var viewFrontPercentage = Math.floor((100 - this.viewPort) / 2);

	this._frontScale = d3.scale.linear();

	this._focusScale = d3.scale.linear();

	this._backScale = d3.scale.linear();

	this.zoom = function(n) {
		this._range = this.scale.range()[1] - this.scale.range()[0];

		var focusFrontMarker =  this.scale.range()[0] + ((this._range / 100) *  focusFrontPercentage);
		var focusBackMarker = focusFrontMarker + ((this._range / 100) * this.focus);
		var viewFrontMarker = this.scale.range()[0] + ((this._range / 100) *  viewFrontPercentage);
		var viewBackMarker = viewFrontMarker + ((this._range / 100) * this.viewPort);

		this._frontScale.domain([this.scale.range()[0], focusFrontMarker]);
		this._frontScale.range([this.scale.range()[0], viewFrontMarker]);

		this._focusScale.domain([focusFrontMarker, focusBackMarker]);
		this._focusScale.range([viewFrontMarker, viewBackMarker]);

		this._backScale.domain([focusBackMarker, this.scale.range()[1]]);
		this._backScale.range([viewBackMarker, this.scale.range()[1]]);

		var z = this.scale(n);

		// map the left side of the focus area
		if ((z >= this.scale.range()[0]) && (z < focusFrontMarker)) {
			z = this._frontScale(z);
		}
		// map the focus area
		if ((z >= focusFrontMarker) && (z <= focusBackMarker)) {
			z = this._focusScale(z);
		}
		// map the right side of the focus area
		if ((z > focusBackMarker) && z <= this.scale.range()[1]) {
			z = this._backScale(z);
		}

		return z;
	};
}