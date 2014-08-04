angular.module("templates").run(["$templateCache", function($templateCache) {$templateCache.put("c-widget.html","<div class=\"c-widget\">\r\n</div>");
$templateCache.put("grid-cell.html","<div class=\"centerized-block default-cell\" ng-style=\"cellStyle(cell.rowIndex, cell.columnIndex, row.isAggregated)\">\r\n	{{cell.value}}\r\n	<div class=\"it-vertical-border right-border\"></div>\r\n	<div class=\"it-horizontal-border bottom-border\"></div>\r\n</div>");
$templateCache.put("it-header-th.html","<div class=\"centerized\">\r\n	{{text}}\r\n</div>");
$templateCache.put("it-pager.html","<div class=\"it-pager\">	\r\n	<div class=\"pager-inner\">	\r\n\r\n		<div class=\"icon icon-first\" ng-click=\"pager.first()\"></div>\r\n		<div class=\"icon icon-previous\" ng-click=\"pager.previous()\"></div>\r\n		<div class=\"icon\" style=\"width:100px\">\r\n			<input ng-model=\"currentPage\" ng-change=\"currentPageChanged()\"/>\r\n			<span>/{{pager.totalPages()}}</span>\r\n		</div>\r\n		<div class=\"icon icon-next\" ng-click=\"pager.next()\"></div>\r\n		<div class=\"icon icon-last\" ng-click=\"pager.last()\" ng-style=\"isLast()\"></div>\r\n		<div class=\"icon\" style=\"width:130px;\">\r\n			<span>per page:</span>\r\n			<input ng-model=\"pager.paginateNumber\" ng-change=\"currentPageChanged()\" style=\"width:50px;\"/>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("it-subtotal.html","<div class=\"it-header-sub-block it-header-subtotal\">	\r\n	<div it-th class=\"it-header-cell\">\r\n	</div>\r\n</div>");
$templateCache.put("it-table.html","<div class=\"ips2-table\">	\r\n	<div class=\"it-main-container\">\r\n		<div it-scroll-container=\"horizontal\"></div>\r\n		<div it-scroll-container=\"vertical\"></div>\r\n		<div class=\"inner-container\">			\r\n			<div ng-transclude></div>			\r\n			<div it-grid-viewport class=\"it-grid\" ng-style=\"gridStyle()\">				\r\n				<div class=\"grid-container\">\r\n					<div class=\"it-vertical-border left-border\"></div>\r\n					<div ng-repeat=\"row in renderedRows\" on-finish-render>\r\n						<div it-cell class=\"it-grid-cell\" ng-repeat=\"cell in row\">\r\n\r\n							<!--<div it-cell class=\"centerized-block default-cell\" ng-style=\"cellStyle(cell.rowIndex, cell.columnIndex, row.isAggregated)\">\r\n								{{cell.value}}\r\n								<div class=\"it-vertical-border right-border\"></div>\r\n								<div class=\"it-horizontal-border bottom-border\"></div>\r\n							</div>-->\r\n						</div>\r\n					</div>\r\n				</div>\r\n			</div>		\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("itScrollContainer.html","<div class=\"scrollbar-area\">\r\n	<div class=\"scrollbar-area-inner\">\r\n		<div it-scrollbar class=\"scrollbar\">\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("sub-block.html","");}]);