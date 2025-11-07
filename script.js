console.log("JS is working!");
// Main page interactions: counters, smooth scroll, navbar behavior, mobile collapse
document.addEventListener('DOMContentLoaded', () => {
	initCounters();
	initSmoothScroll();
	initNavbarBehavior();
	initNavCollapseOnClick();
});

function initCounters() {
	const stats = document.querySelectorAll('.stat-number');
	if (!stats.length) return;

	stats.forEach(el => {
		// read target from data-target if present, otherwise from element text
		let rawTarget = (el.dataset && el.dataset.target) ? String(el.dataset.target).trim() : el.textContent.trim();
		// determine suffix: explicit data-suffix, or '%' if the label includes it or rawTarget ends with '%'
		let suffix = '';
		if (el.dataset && el.dataset.suffix) {
			suffix = el.dataset.suffix;
		} else if (/\%$/.test(rawTarget)) {
			suffix = '%';
			rawTarget = rawTarget.replace('%', '');
		} else {
			// check sibling label for a percent sign (e.g., "Placement %")
			const labelEl = el.nextElementSibling;
			if (labelEl && /%/.test(labelEl.textContent)) suffix = '%';
		}

		const numeric = rawTarget.replace(/,/g, '');
		const target = parseInt(numeric, 10) || 0;

		// animate from 0 to target
		let current = 0;
		const duration = 1200; // ms
		let start = null;

		function step(now) {
			if (!start) start = now;
			const progress = Math.min((now - start) / duration, 1);
			const eased = easeOutCubic(progress);
			const value = Math.floor(eased * target);
			el.textContent = value.toLocaleString() + suffix;
			if (progress < 1) {
				requestAnimationFrame(step);
			} else {
				el.textContent = target.toLocaleString() + suffix;
			}
		}

		// Option: start animation only when in viewport
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver(entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						requestAnimationFrame(step);
						io.unobserve(entry.target);
					}
				});
			}, { threshold: 0.3 });
			io.observe(el);
		} else {
			requestAnimationFrame(step);
		}
	});

	function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
}

function initSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach(a => {
		a.addEventListener('click', function(e) {
			const href = this.getAttribute('href');
			if (href === '#' || href === '') return;
			const target = document.querySelector(href);
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});
}

function initNavbarBehavior() {
	const nav = document.querySelector('.navbar');
	if (!nav) return;

	function onScroll() {
		if (window.scrollY > 20) nav.classList.add('scrolled');
		else nav.classList.remove('scrolled');
	}

	window.addEventListener('scroll', throttle(onScroll, 150));
	onScroll();

	// small style helper: if .navbar.scrolled is present, CSS can add shadow
}

function initNavCollapseOnClick() {
	const toggler = document.querySelector('.navbar-toggler');
	const collapseEl = document.querySelector('.navbar-collapse');
	if (!toggler || !collapseEl) return;

	document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
		link.addEventListener('click', () => {
			// if toggler is visible (mobile), collapse the menu after click
			if (window.getComputedStyle(toggler).display !== 'none') {
				const bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl);
				bsCollapse.hide();
			}
		});
	});
}

// Utility: simple throttle
function throttle(fn, wait) {
	let last = 0;
	return function(...args) {
		const now = Date.now();
		if (now - last >= wait) {
			last = now;
			fn.apply(this, args);
		}
	};
}

