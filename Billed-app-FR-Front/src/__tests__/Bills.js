/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import { formatStatus } from "../app/format.js"




describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const windowIcon = screen.getByTestId("icon-window")
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })


    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = [...bills].sort((a, b) =>
        new Date(a.date) < new Date(b.date) ? 1 : -1
      )
      document.body.innerHTML = BillsUI({ data: sortedBills })
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Cliquez sur le bouton Nouvelle facture pour accéder à la page Nouvelle facture.", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee" })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = jest.fn()
      document.body.innerHTML = `<button data-testid="btn-new-bill">New Bill</button>`
      const billsPage = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      fireEvent.click(buttonNewBill)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
    })


    test("Cliquer sur une icône en forme d'œil devrait appeler handleClickIconEye", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee" })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const handleClickIconEye = jest.fn()
      document.body.innerHTML = `<div data-testid="icon-eye" data-bill-url="https://test.storage.tld/bill.jpg"></div>`
      const billsPage = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      })
      billsPage.handleClickIconEye = handleClickIconEye
      const iconEye = screen.getByTestId("icon-eye")
      fireEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalledWith(iconEye)
    })

    test("L'image de la facture s'affiche dans une modale lors du clic sur l'œil", () => {
    document.body.innerHTML = `
      <div id="modaleFile" style="width: 600px;">
        <div class="modal-body"></div>
      </div>
      <div data-testid="icon-eye" data-bill-url="https://test.storage.tld/bill.jpg"></div>
    `
    const billsPage = new Bills({
      document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: window.localStorage,
    })

    $.fn.modal = jest.fn()

    const iconEye = screen.getByTestId("icon-eye")
    fireEvent.click(iconEye)

    const img = document.querySelector(".modal-body img")
    expect(img).toBeTruthy()
    expect(img.src).toBe("https://test.storage.tld/bill.jpg")
    expect($.fn.modal).toHaveBeenCalledWith('show')
  })


    test("getBills trie correctement les factures et retourne le bon format", async () => {
    const storeMock = {
      bills: () => ({
        list: () => Promise.resolve([
          { id: "1", date: "2022-12-01", status: "pending" },
          { id: "2", date: "2023-01-10", status: "accepted" },
          { id: "3", date: "2021-05-05", status: "refused" },
        ])
      })
    }

    const billsPage = new Bills({
      document,
      onNavigate: jest.fn(),
      store: storeMock,
      localStorage: window.localStorage,
    })

    const result = await billsPage.getBills()
    expect(result.length).toBe(3)
    expect(result[0].date).toBe("2023-01-10")
    expect(result[2].date).toBe("2021-05-05")
    expect(result[0].status).toBe(formatStatus("accepted"))
  })

  })
})