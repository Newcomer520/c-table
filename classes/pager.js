
/*
	handle what should be done as page changed.
*/
function pager(scope, paginateNumber, ItDomService) {
	var self = this;

	return {		
		getCurrentPage: function() {
			return this.currentPage;
		},
		currentPage: 1,
		paginateNumber: angular.isDefined(paginateNumber) ? parseInt(paginateNumber): 1,
		next: function() {
			var pager = this;

			if (pager.currentPage + 1 > pager.totalPages())
				return false;
			var pager = this;
			pager.currentPage++;
			pager.paginate();
		},
		previous: function() {
			var pager = this;
			
			if (pager.currentPage - 1 < 1)
				return false;
			var pager = this;
			pager.currentPage--;
			pager.paginate();
		},
		last: function() {
			var pager = this;
			
			pager.currentPage = pager.totalPages();
			pager.paginate();
		},
		first: function() {
			var pager = this;
			
			pager.currentPage = 1;
			pager.paginate();
		},
		paginate: function(cp) {
			var pager = this
			,	i
			,	currentPage;
			
			cp = cp || pager.currentPage;

			currentPage = pager.currentPage = parseInt(cp);
			//if (scope.groups.row.disabled === true)
				//return;						
			scope.renderedRows = [];
			for (i = (currentPage - 1) * pager.paginateNumber; i < currentPage * pager.paginateNumber && i < scope.rawRows.length; i++) {
				scope.renderedRows.push(scope.rawRows[i]);		
			}
			//scope.$parent.tmpDate = new Date();
			//scope.$parent.$broadcast('paginate', currentPage);
			scope.$$nextSibling.tmpDate = new Date();
			scope.broadcast('paginate', currentPage);
		},
		totalPages: getTotalPages
	}

	function getTotalPages() {
		var pager = this;
		if (!angular.isDefined(scope.rawRows))
			return 0;
		return parseInt(scope.rawRows.length / pager.paginateNumber) + (scope.rawRows.length % pager.paginateNumber == 0 ? 0 : 1);
	}
}


