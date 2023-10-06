import { PriceHistoryItem, Product } from "@/types";


const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = element.text().trim();

    if(priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, '');

      let firstPrice; 

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      } 

      return firstPrice || cleanPrice;
    }
  }

  return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any) {
  // these are possible elements holding description of the product
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    // Add more selectors here if needed
    ".a-unordered-list .a-vertical .a-spacing-mini"
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }

  // If no matching elements were found, return an empty string
  return "";
}

// Extracts the category from the product
export function extractCategory($: any) {
  const selectors = [
    '#nav-subnav'
  ];
  for (const selector of selectors) {  
    const element = $(selector);
    if (element.length > 0) {
      const category = element.attr('data-category');
      return category;
    }
  }
  
  return "";
}

// Extract number of reviews
export function extractReviews($: any) {
  const selector = '#acrCustomerReviewText';  
  const element = $(selector);
  if (element.length > 0) {
    const reviewText = element.text();
    const reviewCount = reviewText.split(' ')[0];
    const reviewCountWithoutComma = reviewCount.replace(/,/g, '');
    return parseInt(reviewCountWithoutComma);
  }
  
  return 0;
}

// Extract number of stars
export function extractStarsRating($: any) {
  const selector = 'span.a-icon-alt';  
  const element = $(selector);
  if (element.length > 0) {
    const ratingText = element.first().text(); // Gets the text of the first matched element
    const rating = parseFloat(ratingText.split(' ')[0]); //Extracts the rating value
    return rating;
  }
  
  return 0;
}


// Extract number of rating
// export function extractRating($: any) {
//   const selector = 'span[data-hook="rating-out-of-text"]';
//   const element = $(selector);
//   if (element.length > 0) {
//     const ratingText = element.text();
//     return ratingText;
//   }
  
//   return 'No ratings found';
// }


export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (((scrapedProduct.originalPrice / scrapedProduct.currentPrice) - 1) * 100 >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export const formatRating = (rating: number = 0) => {
  return rating.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};


