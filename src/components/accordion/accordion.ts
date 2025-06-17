import { renderAccordionModal } from './accordion-modal.ts';

type AccordionItem = {
    title: string;
    content: string;
}

function decorateAccordion(accordion: HTMLElement) {

    const h1 = document.querySelector<HTMLElement>('h1');
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'accordion-container';
    accordion.parentNode?.insertBefore(accordionContainer, accordion);
    
    if (h1) {
        accordionContainer.appendChild(h1);
    }
    
    accordionContainer.appendChild(accordion)

    const [headerDiv, ...contentDivs] = Array.from(accordion.children) as HTMLElement[];
    
    // Extract header information
    const [titleSection, contactSection] = Array.from(headerDiv.children) as HTMLElement[];
    const mainTitle = titleSection.querySelector('h2')?.textContent || 'Accordion';
    const contactTitle = contactSection.querySelector('h2')?.textContent || 'Contact Us';
    
    // Clear accordion and set up structure
    accordion.innerHTML = '';
    accordion.className = 'accordion-component';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'accordion-header';
    
    const titleElement = document.createElement('h2');
    titleElement.className = 'accordion-title';
    titleElement.textContent = mainTitle;
    
    const contactButton = document.createElement('button');
    contactButton.className = 'button primary contact-button';
    contactButton.textContent = contactTitle;
    contactButton.setAttribute('aria-label', 'Open contact form');
    
    header.appendChild(titleElement);
    header.appendChild(contactButton);
    accordion.appendChild(header);
    
    // Create accordion items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'accordion-items';
    accordion.appendChild(itemsContainer);
    
    // Process accordion items - each contentDiv is a wrapper containing question and answer divs
    const accordionItems: AccordionItem[] = [];
    contentDivs.forEach(wrapperDiv => {
        const children = Array.from(wrapperDiv.children) as HTMLElement[];
        if (children.length >= 2) {
            const questionDiv = children[0];
            const answerDiv = children[1];
            
            accordionItems.push({
                title: questionDiv.textContent?.trim() || '',
                content: answerDiv.innerHTML || ''
            });
        }
    });
    
    let visibleItems = 4;
    
    function renderItems() {
        itemsContainer.innerHTML = '';
        
        // Render visible items
        accordionItems.slice(0, visibleItems).forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'accordion-item';
            itemElement.setAttribute('data-index', index.toString());
            
            const titleButton = document.createElement('button');
            titleButton.className = 'accordion-item-title';
            titleButton.setAttribute('aria-expanded', 'false');
            titleButton.setAttribute('aria-controls', `accordion-content-${index}`);
            titleButton.setAttribute('id', `accordion-button-${index}`);
            
            const titleText = document.createElement('span');
            titleText.textContent = item.title;
            
            const icon = document.createElement('img');
            icon.className = 'accordion-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.setAttribute('src', '../../images/chevron-down-black.svg');
            //icon.innerHTML = '+';
            
            titleButton.appendChild(titleText);
            titleButton.appendChild(icon);
            
            const contentElement = document.createElement('div');
            contentElement.className = 'accordion-item-content';
            contentElement.setAttribute('id', `accordion-content-${index}`);
            contentElement.setAttribute('aria-labelledby', `accordion-button-${index}`);
            contentElement.setAttribute('aria-hidden', 'true');
            
            const contentInner = document.createElement('div');
            contentInner.className = 'accordion-content-inner';
            contentInner.innerHTML = item.content;
            
            contentElement.appendChild(contentInner);
            itemElement.appendChild(titleButton);
            itemElement.appendChild(contentElement);
            itemsContainer.appendChild(itemElement);
            
            // Add click handler
            itemElement.addEventListener('click', () => toggleAccordionItem(itemElement, titleButton, contentElement, icon));
            
            // Add keyboard support
            itemElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordionItem(itemElement, titleButton, contentElement, icon);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    focusNextItem(index);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    focusPreviousItem(index);
                }
            });
        });
        
        // Add load more button if needed
        if (visibleItems < accordionItems.length) {
            const loadMoreButton = document.createElement('button');
            loadMoreButton.className = 'button secondary load-more-button';
            loadMoreButton.textContent = 'View More';
            loadMoreButton.setAttribute('aria-label', `Load ${Math.min(4, accordionItems.length - visibleItems)} more FAQ items`);
            
            loadMoreButton.addEventListener('click', () => {
                visibleItems = Math.min(visibleItems + 4, accordionItems.length);
                renderItems();
            });
            
            itemsContainer.appendChild(loadMoreButton);
        }
    }
    
    function toggleAccordionItem(
        itemElement: HTMLElement, 
        titleButton: HTMLButtonElement, 
        contentElement: HTMLElement, 
        icon: HTMLImageElement
    ) {
        const isExpanded = titleButton.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            // Collapse
            titleButton.setAttribute('aria-expanded', 'false');
            contentElement.setAttribute('aria-hidden', 'true');
            itemElement.classList.remove('expanded');
            icon.setAttribute('aria-label', 'Expand');
        } else {
            // Expand
            titleButton.setAttribute('aria-expanded', 'true');
            contentElement.setAttribute('aria-hidden', 'false');
            itemElement.classList.add('expanded');
            icon.setAttribute('aria-label', 'Collapse');
        }
    }
    
    function focusNextItem(currentIndex: number) {
        const nextIndex = Math.min(currentIndex + 1, visibleItems - 1);
        const nextButton = itemsContainer.querySelector(`[data-index="${nextIndex}"] .accordion-item-title`) as HTMLButtonElement;
        nextButton?.focus();
    }
    
    function focusPreviousItem(currentIndex: number) {
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prevButton = itemsContainer.querySelector(`[data-index="${prevIndex}"] .accordion-item-title`) as HTMLButtonElement;
        prevButton?.focus();
    }

    function getGoogleFont():void {
        
        if (document.querySelector('link[href*="fonts.googleapis.com/css2?family=Noto+Sans"]')) {
            return;
        }

        const preconnectGoogle = document.createElement('link');
        preconnectGoogle.rel = 'preconnect';
        preconnectGoogle.href = 'https://fonts.googleapis.com';

        const preconnectGstatic = document.createElement('link');
        preconnectGstatic.rel = 'preconnect';
        preconnectGstatic.href = 'https://fonts.gstatic.com';
        preconnectGstatic.crossOrigin = 'anonymous';

        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap';
        fontLink.rel = 'stylesheet';

        const head = document.head;
        head.appendChild(preconnectGoogle);
        head.appendChild(preconnectGstatic);
        head.appendChild(fontLink);
    }
    
    // Contact button handler
    contactButton.addEventListener('click', async () => {
        try {
            await renderAccordionModal();
        } catch (error) {
            console.error('Error opening contact modal:', error);
        }
    });
    
    // Initial render
    getGoogleFont();
    renderItems();
}

window.addEventListener('DOMContentLoaded', () => {
    const accordion = document.querySelector<HTMLElement>('.accordion'); 
    if (!accordion) return;
    decorateAccordion(accordion);
});