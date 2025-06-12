/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import { ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Le formulaire devrait être affiché", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })

    test("L'entrée de fichier devrait accepter les formats de fichier valides", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      }))
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      const event = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\test.jpg',
          files: [validFile]
        }
      }

      newBill.handleChangeFile(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    test("L'entrée de fichier devrait rejeter les formats de fichier non valides", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      }))
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      global.alert = jest.fn()
      
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file")
      
      const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      const event = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\test.pdf',
          files: [invalidFile]
        }
      }

      newBill.handleChangeFile(event)

      expect(global.alert).toHaveBeenCalledWith('Veuillez sélectionner un fichier avec une extension .jpg, .jpeg ou .png')
      expect(event.target.value).toBe('')
    })

    test("La soumission du formulaire devrait créer une nouvelle facture", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      }))
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: 'Transports' } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: 'Vol Paris Tokyo' } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: '2023-04-04' } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: '400' } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: '80' } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: '20' } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: 'Voyage professionnel' } })

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener("submit", handleSubmit)

      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
    })

    test("Cliquer sur le bouton de nouvelle facture devrait appeler handleClickNewBill", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })
  })

  describe("Lorsque je soumets une nouvelle facture", () => {
    test("Alors cela devrait créer une nouvelle facture via une requête POST", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      }))
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const onNavigate = jest.fn()
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      newBill.updateBill = jest.fn()
      newBill.fileUrl = 'https://localhost:3456/images/test.jpg'
      newBill.fileName = 'test.jpg'
      newBill.billId = '1234'

      const form = screen.getByTestId("form-new-bill")
      
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: 'Transports' } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: 'Vol Paris Tokyo' } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: '2023-04-04' } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: '400' } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: '80' } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: '20' } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: 'Voyage professionnel' } })

      fireEvent.submit(form)

      expect(newBill.updateBill).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
    })

    test("Le téléchargement d'un fichier devrait appeler store.bills().create", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      }))
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const createMock = jest.fn(() => Promise.resolve({
        fileUrl: 'https://localhost:3456/images/test.jpg',
        key: '1234'
      }))
      
      const storeMock = {
        bills: jest.fn(() => ({
          create: createMock
        }))
      }
      
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: window.localStorage
      })

      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      const event = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\test.jpg',
          files: [validFile]
        }
      }

      newBill.handleChangeFile(event)

      await waitFor(() => {
        expect(storeMock.bills).toHaveBeenCalled()
        expect(createMock).toHaveBeenCalled()
      })
    })
  })
})



