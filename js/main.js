'use strict';

// Api access token
import { ACCESS_TOKEN } from '../config.js';

// New Registry Button Selector
const insertButton = document.querySelector('.btn__insert');

// Error Message Selectors
const messageContainer = document.querySelector('.message');
const messageParag = document.querySelector('.message__parag');

// Table
const tableBody = document.querySelector('.table__data-box');

// New Registry / Edit Registry Form
const form = document.querySelector('.form');
const formIdInput = document.querySelector('.form #id');
const formEmailInput = document.querySelector('.form__input#email');
const formNameInput = document.querySelector('.form__input#name');
const formGenderInput = document.querySelector('.form__select#gender');
const formStatusInput = document.querySelector('.form__select#status');
const formConfirmButton = document.querySelector('.form__btn--confirm');
const formCancelButton = document.querySelector('.form__btn--cancel');

// Delete Confirmation Box
const deleteConfirmationBox = document.querySelector('.delete');
const deleteBoxConfirmBtn = document.querySelector('.delete__btn--delete');
const deleteBoxCancelBtn = document.querySelector('.delete__btn--cancel');

// Page Overlay
const overlay = document.querySelector('.overlay');

class App {
	#apiToken = ACCESS_TOKEN;
	#isFormActionEdit = false;

	constructor() {
		this.#renderAllUsers();

		// Novo Registro button Event Listener
		this.#addEventNewRegistryButton();

		// Form Event Listeners
		this.#addEventFormCancelButton();
		this.#addEventFormConfirmButton();

		// Delete Box Event Listeners
		this.#addEventDeleteBoxCancelBtn();
		this.#addEventDeleteBoxConfirmBtn();
	}

	/**
	 * -=================================
	 * ======== CRUD OPERATIONS =========
	 * ==================================
	 */

	/**
	 * Consults the information about a specific user in the API and
	 * returns that information as an object.
	 * @param {Number} id
	 * @returns Object
	 */
	async #getUser(id) {
		const url = `https://gorest.co.in/public/v2/users/${id}`;

		try {
			const response = await fetch(url);

			if (response.status === 200) {
				const user = await response.json();
				this.#displaySuccess(`Status 200: O registro foi encontrado no sistema.`);
				return user;
			} else if (response.status === 404) {
				throw `Erro ${response.status}: O registro não foi encontrado no sistema.`;
			}
		} catch (err) {
			this.#displayErrors(err);
		}
	}

	/**
	 * Gets the data of the users in the api and returns them as an array of objects.
	 * @returns Array
	 */
	async #getAllUsers() {
		const url = 'https://gorest.co.in/public/v2/users';

		try {
			const response = await fetch(url);
			const users = await response.json();

			if (!users) {
				throw `Erro: Algum erro ocorreu durante a busca dos registros. Tente novamente mais tarde.`;
			} else {
				// this.#displaySuccess(`Os registros foram encontrados no sistema.`);
				return users;
			}
		} catch (err) {
			this.#displayErrors(`Erro:` + err);
		}
	}

	/**
	 * Sends a request to the api to create a new user.
	 * @param {Object} newUserObj
	 */
	async #createUser(newUserObj) {
		const url = `https://gorest.co.in/public/v2/users`;

		// prettier-ignore
		const config = {
            method: 'POST',
            body: JSON.stringify(newUserObj),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${this.#apiToken}`
            }
        };

		try {
			const response = await fetch(url, config);

			if (response.status === 201) {
				this.#displaySuccess(`Status 201: Novo registro feito com sucesso.`);
				this.#renderAllUsers();
			} else if (response.status === 401) {
				throw `Erro 401: Houve um erro de autenticação durante a operação. Criação de registro falhou.`;
			} else if (response.status === 422) {
				throw `Erro 401: Houve um erro durante a validação dos dados. Insira os dados corretamente e tente novamente.`;
			}
		} catch (err) {
			this.#displayErrors(err);
		}
	}

	/**
	 * Upadates the information of the user through an api call with the method PUT.
	 * @param {Object} updatedInfoObj
	 */
	async #editUser(updatedInfoObj) {
		const url = `https://gorest.co.in/public/v2/users/${updatedInfoObj.id}`;
		// prettier-ignore
		const config = {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${this.#apiToken}`
            },
            body: JSON.stringify(updatedInfoObj)
        };

		try {
			const response = await fetch(url, config);
			console.log(response);

			if (response.status === 200) {
				this.#displaySuccess(`Status 200: Registro atualizado com sucesso.`);
				this.#renderAllUsers();
			} else if (response.status === 404) {
				throw `Erro 404: O registro não foi encontrado no sistema. Atualize a página e tente novamente.`;
			} else if (response.status === 401) {
				throw `Erro 401: Houve um erro de autenticação durante a operação. Edição falhou.`;
			}
		} catch (err) {
			this.#displayErrors(err);
		}
	}

	/**
	 * Receives an user id and make an api call to delete the respective user.
	 * @param {Number} id
	 */
	async #deleteUser(id) {
		const url = `https://gorest.co.in/public/v2/users/${id}`;
		// prettier-ignore
		const config = {
            method: 'DELETE',
            headers: {
                'Authorization' : `Bearer ${this.#apiToken}`
            },
        };

		try {
			const response = await fetch(url, config);
			console.log(response);
			if (response.status === 204) {
				this.#displaySuccess(`Status 204: Registro deletado com sucesso.`);
				this.#renderAllUsers();
			} else if (response.status === 404) {
				throw `Erro 404: O registro não foi encontrado no sistema. Atualize a página e tente novamente.`;
			} else if (response.status === 401) {
				throw `Erro 401: Houve um erro de autenticação durante a operação. Exclusão falhou.`;
			}
		} catch (err) {
			this.#displayErrors(err);
		}
	}

	/**
	 * -=================================
	 * =========== UI METHODS ===========
	 * ==================================
	 */

	// ========= MESSAGE BOX METHODS ==========
	/**
	 * Displays an error message in the page, and after a certain
	 * amount of time, turns the message box to opacity 0.
	 * @param {String} errorString
	 */
	#displayErrors(errorString) {
		messageContainer.style.opacity = 1;
		messageContainer.style.backgroundColor = '#ffaaaa';
		messageParag.innerHTML = errorString;

		setInterval(() => {
			messageContainer.style.opacity = 0;
		}, 3000);
	}

	/**
	 * Displays an success message in the page, and after a certain
	 * amount of time, turns the message box to opacity 0.
	 * @param {String} errorString
	 */
	#displaySuccess(successString) {
		messageContainer.style.opacity = 1;
		messageContainer.style.backgroundColor = '#8cf587';
		messageParag.innerHTML = successString;

		setInterval(() => {
			messageContainer.style.opacity = 0;
		}, 3000);
	}
	// ========= TABLE METHODS ==========
	/**
	 * Render users information fetched by the API on tbody element.
	 */
	async #renderAllUsers() {
		// Return the users data from the API
		const users = await this.#getAllUsers();
		tableBody.innerHTML = '';
		// Dymamic insertion of the users info in the table body
		users.forEach(user => {
			tableBody.insertAdjacentHTML(
				'beforeend',
				`<tr class="table__row" data-id="${user.id}">
                    <td class="table__data">${user.id}</td>
                    <td class="table__data">${user.name}</td>
                    <td class="table__data">${user.email}</td>
                    <td class="table__data table__data--actions">
                        <button class="table__btn table__btn--edit">Editar</button>
                        <button class="table__btn table__btn-delete">Excluir</button>
                    </td>
                </tr>`
			);
		});

		// Adding Event Listeners to the actions buttons after they're inserted in the html
		this.#addEventsTableDeleteButtons();
		this.#addEventsTableEditButtons();
	}

	// ========= FORM METHODS ============
	/**
	 * Display/hide the New Registry / Edit Registry Form
	 */
	#toggleFormModal() {
		overlay.classList.toggle('overlay--active');
		form.classList.toggle('form--active');
	}

	#formValidation() {
		const name = formNameInput.value.trim();
		const email = formEmailInput.value.trim();
		const gender = formGenderInput.value;
		const status = formStatusInput.value;

		if (!name || !email || !gender || !status) return false;
		if (name === ' ' || email === ' ') return false;

		return { name: name, email: email, gender: gender, status: status };
	}

	/**
	 * Clear the values in the New Registry / Edit Registry Form.
	 */
	#cleanFormValues() {
		formIdInput.value = null;
		formNameInput.value = null;
		formEmailInput.value = null;
		formGenderInput.value = null;
		formStatusInput.value = null;
	}

	/**
	 * Fetch the user data from the given id and inserts the info in the form inputs.
	 * @param {Number} id
	 */
	async #getEditValuesInForm(id) {
		// Fetchs the data of the user
		const userData = await this.#getUser(id);

		// If the user is undefined the form is closed and the function returned
		if (userData === undefined) {
			this.#toggleFormModal();
			return;
		}

		formIdInput.value = userData.id;
		formNameInput.value = userData.name;
		formEmailInput.value = userData.email;
		formGenderInput.value = userData.gender;
		formStatusInput.value = userData.status;
	}

	// ======= DELETE BOX METHODS ========
	/**
	 * Display/hide the Delete Confirmation Box.
	 */
	#toggleDeleteBox() {
		overlay.classList.toggle('overlay--active');
		deleteConfirmationBox.classList.toggle('delete--active');
	}

	/**
	 * -=================================
	 * ======== EVENT LISTENERS =========
	 * ==================================
	 */

	/**
	 * Add an event listener in the button New Registry that opens the
	 * form with the option set to create a new user.
	 */
	#addEventNewRegistryButton() {
		insertButton.addEventListener('click', () => {
			this.#toggleFormModal();

			// Set the operation in the form to create a new user.
			this.#isFormActionEdit = false;
		});
	}

	// TABLE EVENTS
	/**
	 * Selects and add event listeners that opens the Delete Confirmation
	 * Box on the delete buttons of the table.
	 */
	#addEventsTableDeleteButtons() {
		// Selects all the delete buttons in the table
		const deleteButtons = document.querySelectorAll('.table__btn-delete');
		deleteButtons.forEach(btn => {
			btn.addEventListener('click', e => {
				this.#toggleDeleteBox();

				// Puts the corresponding id on the title of the Delete Confirmation Box.
				const parentId = e.target.closest('.table__row').dataset.id;
				document.querySelector('.delete__title span').innerHTML = parentId;
			});
		});
	}

	/**
	 * Selects and add event listeners that opens the New Registry / Edit Registry Form
	 * with the option of update the user, also populates the inputs with values of
	 * the respective user.
	 */
	#addEventsTableEditButtons() {
		// Select all edit buttons on the table
		const editButtons = document.querySelectorAll('.table__btn--edit');
		editButtons.forEach(btn => {
			btn.addEventListener('click', e => {
				// Get the corresponding id of the edit button
				const parent = e.target.closest('.table__row');
				const id = parent.dataset.id;

				// Insert the user data of the corresponding id in the form
				this.#getEditValuesInForm(id);
				this.#toggleFormModal();
				// Set the operation in the form to Edit Registry
				this.#isFormActionEdit = true;
			});
		});
	}

	// FORM EVENTS
	/**
	 * Add an event listener to the Confirm button in the Form New Registry / Edit Registry,
	 * based on the type of operation called creates a new user or edits an existing user.
	 */
	#addEventFormConfirmButton() {
		formConfirmButton.addEventListener('click', e => {
			e.preventDefault();

			// Receiving an object with the form data or false if the validation was unsuccesfull
			const formDataObj = this.#formValidation();

			// Checks if the Form Validation returned false
			if (formDataObj === false) {
				this.#displayErrors(`Erro: Verifique os valores no formulário e tente novamente.`);
				return;
			}

			// Checks if the operation is set to edition
			if (this.#isFormActionEdit) {
				formDataObj.id = formIdInput.value;
				this.#editUser(formDataObj);
				this.#toggleFormModal();
				this.#cleanFormValues();
				return;
			}

			// Create user flow
			this.#createUser(formDataObj);
			this.#toggleFormModal();
			this.#cleanFormValues();
			return;
		});
	}

	/**
	 * Event listener added to the Cancel button in the form, closes de form and
	 * clean the input values.
	 */
	#addEventFormCancelButton() {
		formCancelButton.addEventListener('click', e => {
			e.preventDefault();
			this.#cleanFormValues();
			this.#toggleFormModal();
		});
	}

	// DELETE CONFIRMATION BOX
	/**
	 * Adds an event listener to the Confirm button in the Delete Confirmation Box that calls the deleteUser method
	 * based on the id.
	 */
	#addEventDeleteBoxConfirmBtn() {
		deleteBoxConfirmBtn.addEventListener('click', () => {
			const userId = document.querySelector('.delete__title span').innerHTML;
			this.#deleteUser(userId);
			this.#toggleDeleteBox();
		});
	}

	/**
	 * Event Listener in the Cancel button that cçpses the Delete Confirmation Box.
	 */
	#addEventDeleteBoxCancelBtn() {
		deleteBoxCancelBtn.addEventListener('click', () => {
			console.log('Cancelado');
			this.#toggleDeleteBox();
		});
	}
}

const app = new App();
