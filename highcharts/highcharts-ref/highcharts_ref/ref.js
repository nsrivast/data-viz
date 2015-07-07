var index = {},
	currentSection;
	
// Utility
jQuery.fn.sort = function() {  
	return this.pushStack( [].sort.apply( this, arguments ), []);  
};

$(function() {
	
	
	// Simplify for testing
	/*$('.demo a').each(function() {
		this.target = '_blank';
	});
	document.getElementById('reference-loading').style.display = 'none';
	document.getElementById('content').className = '';
	return;
	*/
	
	
	
	var stack = [];
	
	// index the entire docs
	$('div.section').each(function() { // loop the sections
		var sec = this;
	
		// add to a stack for asynchronous evaluation to prevent locking up the browser
		stack.push(function() { 
	
			var section = sec,
				objectTitle = $('h2', section)[0].innerHTML,
				extendsArr = $('.extends', section);
			members = {
				_fullName: objectTitle, // private
				_fullNameEscaped: objectTitle.replace(/\./g, '-'),
				_extends: extendsArr[0] ? $.trim(extendsArr[0].innerHTML.replace(/Extends/, '')) : null
			};
			
			// give all section divs an id
			section.id = objectTitle.replace(/\./g, '-');
			
			// loop the members
			$members = $('div.member', section);
			$members.each(function() {
				var name = $('.name', this)[0].innerHTML,
					types = $('.type', this);
				members[name] = $('.default', this)[0].innerHTML;
				members['_typeof_'+ name] = types.length ? types[0].innerHTML : null;
				
				this.id = section.id +'-member-'+ name;
	
			});
			if (/(colors|symbols)/.test(objectTitle)) members['_noMembers'] = true;
			
			// handle inheritance
			if (extendsArr[0]) {
				var extendsName = $.trim(extendsArr[0].innerHTML.replace(/Extends/, '')),
					arr = extendsName.split(/\./),
					objName = arr[arr.length - 1],
					parent = eval ('index.' + extendsName.replace('.'+ objName, '')),			
					insertAfter,
					extendsObject = parent[objName] || parent;
				
				$.each(extendsObject, function(name, value) {
					if (!/^_/.test(name)) {
						var copyFromId = extendsName.replace(/\./g, '-') +'-member-'+ name, 
							clone;
						// member exists in the original object, not in the new
						if (members[name] === undefined) {
							// add to index
							members[name] = value;
							members['_typeof_'+ name] = extendsObject['_typeof_'+ name];
							
							// inject node
							var clone = document.getElementById(copyFromId).cloneNode(1);
								
							clone.id = section.id +'-member-'+ name;
							if (insertAfter) $('#'+ insertAfter).after(clone);
							else if ($members[0]) $($members[0]).before(clone);
							else $(section).append(clone);
							
						}
						insertAfter = section.id +'-member-'+ name;
					}
				});
			}
			
			if (/\./.test(objectTitle)) { // append to parent object
				var arr = objectTitle.split(/\./),
					objName = arr[arr.length - 1],
					parent = eval ('index.' + objectTitle.replace('.'+ objName, ''));
				
				
				parent[objName] = members;
	
			} else { // append to main index
				index[objectTitle] = members;
			}
		});
		

		
	});
	execStack(stack, index);

});

function execStack(stack, index) {
	var start = +new Date();
	while (stack.length) {
		var fn = stack.shift();
		fn();
		
		if (new Date() - start > 50) {
			setTimeout(function(){
				execStack(stack, index)
			}, 50);
			break;
		}
	}
	
	if (stack.length == 0) {
		afterParse(index);
	}
}


function afterParse(index) {
	// sort the top level
	var unsortedIndex = index,
		sortArray = [],
		index = {};
		
	$.each (unsortedIndex, function(key, value) {
		if (key != 'exporting' && key != 'navigation') sortArray.push(key);
	});
	sortArray = sortArray.sort();
	$.each (sortArray, function(i, value) {
		index[value] = unsortedIndex[value];
	})
	index.exporting = unsortedIndex.exporting;
	index.navigation = unsortedIndex.navigation;
	
	
	// add the navigation
	var $nav = $('#nav #options');
	function doLevel(level, obj, key) {
		s += '<div class="level level-'+ level +'" id="'+ key +'-menu">';
		$.each(obj, function(member, value) {

	
			if (/^_/.test(member)) {} // private properties for the index
			else if (typeof value == 'string')
				s += '<div>'+ member +"<span class='value'>: "+ value +",</span></div>";
				
			else if (value._noMembers) {
				s += '<div><a href="#'+ value._fullNameEscaped +
					'">'+ member +"</a>: [...]</div>";

			} else if (typeof value == 'object') {
				var isArray = /^Array/.test(obj['_typeof_'+ member]) || member == 'series',
					bracketsOpen = isArray ? '[{' : '{',
					bracketsClose = isArray ? '}]' : '}'; 
					
				if (member == 'exporting') {
					s += '<div class="comment">// exporting module</div>';
				}
					
				s += '<div class="menuitem collapsed"><a href="#'+ value._fullNameEscaped +
					'">'+ member +"</a>: "+ bracketsOpen +"<span class='dots'>...</span>";
				doLevel(level + 1, value, value._fullNameEscaped);
				s += bracketsClose +",</div>";
			}
			
		});
		
		// strip out last comma
		s = s.replace(/,<\/div>$/, '</div>');
		s = s.replace(/,<\/span><\/div>$/, '</span></div>');
		
		s += '</div>';
	};
	
	// build the HTML
	var s = 'var chart = new Highcharts.Chart({<br/>';
	doLevel(0, index);
	//s += ';';
	//$nav.html(s);
	$nav[0].innerHTML += s;
	
	// manipulate the links
	$('#nav a').each(function() {
		var link = this.href.split('#')[1];
		$(this).click(function() {
			var $sectionElement = $('#'+ link);
			//console.log(link, $sectionElement[0].id);
			
			
			if (currentSection) $(currentSection).hide();
			$sectionElement.show();
			currentSection = $sectionElement;
		});
		
		$('<a href="#'+ link +'" class="plus"></a>')
			.insertBefore($(this))
			.click(function() {
				var a = this,
					$container = $('#'+ link +'-menu');
				if (/collapsed/.test(this.parentNode.className)) {
					$container.slideDown();
					this.parentNode.className = 'menuitem expanded';
				} else {
					$container.slideUp('normal', function() {
						a.parentNode.className = 'menuitem collapsed';
					});
					
				}
			});
	});
	
	// handle the content sections
	$('div.member .type').before(' : ');
	$('div.member').each(function(i, member) {
		member.collapsed = true;
		
		// add a means of expanding larger texts
		/*var desc = $('.description', member)[0] || '', 
			fullHeight = desc.offsetHeight + desc.offsetTop,
			collapsedHeight = 32;//$(member).height();
			
		if (fullHeight > collapsedHeight + 12) {
			$('<a href="#expand" class="collapsed"></a>')
				.appendTo(member)
				
				.click(function() {					
					$(member).animate({ maxHeight: member.collapsed ? fullHeight : collapsedHeight });
					
					member.collapsed = !member.collapsed;
					this.className = member.collapsed ? 'collapsed' : 'expanded';	
					
					return false;
				});
		}*/

		// move the default value to the end of the desc. if set
		var def = $('.default', member);
		if (def[0] && def[0].innerHTML != '') {
			$('.description', member).append(' Defaults to <code>'+ def[0].innerHTML +'</code>.');
		}
		
		// mark up demo
		var demo = $('.demo', member);
		if (demo[0]) {
			demo.prepend('Try it: ');
			$('a', demo).attr('target', '_blank');
		}
		
	});
	
	
	$('<span>});</span>').appendTo($nav);
	
	// Hide or show sections on dom ready
	$('div.section, .class-item').each(function(i, element) {
		// hide all sections but one
		if ('#'+ element.id != location.hash) {
			element.style.display = 'none';
		} else {
			currentSection = element;
		}	
		
	});
	
	// Make internal links clickable
	$('a.internal').click(function() {
		if (currentSection) $(currentSection).hide();
		var href = '#' +this.href.split('#')[1];
		$(href).show();
		currentSection = $(href);
		
	});

	// Show the body
	document.getElementById('reference-loading').style.display = 'none';
	document.getElementById('content').className = '';
	
}
