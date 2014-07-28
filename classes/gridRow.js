function gridRow(scope, renderedRow, ItDomService, $compile) {
	var element = $('<div/>')
	,	cells = []
	,	cellElement
	,	centerized
	,	raw = renderedRow
	,	cellStyle
	,	divBorder;
	element.addClass('it-grid-row');
	_.each(renderedRow, function(cell, cIdx) {		

		cellElement = ItDomService.grGridCell();
		
		/*divBorder = $('<div></div>');
		divBorder.addClass('it-vertical-border right-border');
		cellElement.append(divBorder);
		divBorder = $('<div></div>');
		divBorder.addClass('it-horizontal-border bottom-border');
		centerized = $("<div></div");*/
		centerized = document.createElement('div');
		centerized.innerHTML = cell.value;
		//centerized.addClass('centerized');
		//centerized.width(80);
		//centerized.height(30);
		//centerized.text(cell.value);
		cellElement.append(centerized);
		cellElement.append(divBorder);
		//<div class="it-horizontal-border bottom-border"></div>
		element.append(cellElement);
		//cells.push(cellElement);
	});

	return {
		rowElement: element,
		cells: cells
	};
}