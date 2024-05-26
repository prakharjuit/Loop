document.addEventListener('DOMContentLoaded', () => {
    const subscriptionForm = document.getElementById('subscription-form');
    const mealSelectionSection = document.getElementById('meal-selection');
    const mealCategoriesDiv = document.getElementById('meal-categories');
    const submitMealsButton = document.getElementById('submit-meals');
    const paymentSection = document.getElementById('payment-section');
    const paymentForm = document.getElementById('payment-form');
    const stripe = Stripe('YOUR_PUBLIC_STRIPE_KEY');
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    const meals = {
        breakfast: ['Pancakes', 'Omelette', 'Granola'],
        lunch: ['Caesar Salad', 'Chicken Wrap', 'Sushi'],
        dinner: ['Steak', 'Pasta', 'Pizza'],
        desserts: ['Brownie', 'Ice Cream', 'Cheesecake'],
        beverages: ['Smoothie', 'Juice', 'Coffee']
    };

    const mealLimits = {
        6: 6,
        12: 12
    };

    subscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        subscriptionForm.classList.add('hidden');
        mealSelectionSection.classList.remove('hidden');
        loadMeals();
    });

    submitMealsButton.addEventListener('click', () => {
        const selectedMeals = document.querySelectorAll('#meal-categories input:checked');
        if (selectedMeals.length === mealLimits[getBoxSize()]) {
            mealSelectionSection.classList.add('hidden');
            paymentSection.classList.remove('hidden');
        } else {
            alert(`Please select ${mealLimits[getBoxSize()]} meals.`);
        }
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { token, error } = await stripe.createToken(cardElement);
        if (error) {
            displayError(error.message);
        } else {
            handleToken(token);
        }
    });

    function loadMeals() {
        mealCategoriesDiv.innerHTML = '';
        Object.keys(meals).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
            meals[category].forEach(meal => {
                const mealItemDiv = document.createElement('div');
                mealItemDiv.className = 'meal-item';
                mealItemDiv.innerHTML = `
                    <label>${meal}</label>
                    <input type="checkbox" value="${meal}">
                `;
                categoryDiv.appendChild(mealItemDiv);
            });
            mealCategoriesDiv.appendChild(categoryDiv);
        });
    }

    function getBoxSize() {
        return parseInt(document.querySelector('input[name="box-size"]:checked').value);
    }

    function displayError(error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error;
    }

    async function handleToken(token) {
        const response = await fetch('/charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token.id })
        });

        if (response.ok) {
            alert('Payment successful!');
            // Further actions like updating the UI or redirecting the user
        } else {
            displayError('Payment failed.');
        }
    }
});
