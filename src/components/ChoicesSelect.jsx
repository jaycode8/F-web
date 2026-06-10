import { useEffect, useRef } from "react";
import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.min.css";

/**
 * ChoicesSelect — drop-in replacement for <SelectInput> using choices.js.
 *
 * Props:
 *   value        string | number   current value (controlled)
 *   onChange     fn(e)             standard change handler
 *   options      Array<{ value, label, disabled? }>
 *   placeholder  string            shown when nothing selected
 *   error        boolean           red border state
 *   disabled     boolean
 *   className    string
 *
 * Usage:
 *   <ChoicesSelect
 *     value={form.categoryId}
 *     onChange={e => set("categoryId", e.target.value)}
 *     options={categories.map(c => ({ value: c.id, label: c.name }))}
 *     placeholder="Select category"
 *   />
 */
const ChoicesSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    error = false,
    disabled = false,
    className = "",
}) => {
    const selectRef = useRef(null);
    const choicesRef = useRef(null);

    useEffect(() => {
        if (!selectRef.current) return;

        choicesRef.current = new Choices(selectRef.current, {
            searchEnabled: true,
            searchPlaceholderValue: "Search...",
            itemSelectText: "",
            shouldSort: false,
            allowHTML: false,
            searchResultLimit: 20,
            placeholder: true,
            placeholderValue: placeholder,
            noResultsText: "No results found",
            noChoicesText: "No options available",
            classNames: {
                containerOuter: ["choices", "qwin-choices"],
                containerInner: "choices__inner",
                input: "choices__input",
                inputCloned: "choices__input--cloned",
                list: "choices__list",
                listItems: "choices__list--multiple",
                listSingle: "choices__list--single",
                listDropdown: "choices__list--dropdown",
                item: "choices__item",
                itemSelectable: "choices__item--selectable",
                itemDisabled: "choices__item--disabled",
                itemChoice: "choices__item--choice",
                activeState: "is-active",
                focusState: "is-focused",
                openState: "is-open",
                disabledState: "is-disabled",
                highlightedState: "is-highlighted",
                selectedState: "is-selected",
                flippedState: "is-flipped",
                loadingState: "is-loading",
                noResults: "has-no-results",
                noChoices: "has-no-choices",
            },
        });

        const select = selectRef.current;
        select.addEventListener("change", onChange);

        return () => {
            select.removeEventListener("change", onChange);
            if (choicesRef.current) {
                choicesRef.current.destroy();
                choicesRef.current = null;
            }
        };
    }, []);

    // Sync options when they change (e.g. after async fetch)
    useEffect(() => {
        if (!choicesRef.current) return;
        choicesRef.current.clearChoices();
        choicesRef.current.setChoices(
            [
                { value: "", label: placeholder, placeholder: true, selected: !value },
                ...options.map(o => ({
                    value: String(o.value),
                    label: o.label,
                    disabled: o.disabled ?? false,
                    selected: String(o.value) === String(value),
                })),
            ],
            "value",
            "label",
            true
        );
    }, [options]);

    // Sync value when it changes externally (e.g. prefill on edit)
    useEffect(() => {
        if (!choicesRef.current) return;
        choicesRef.current.setChoiceByValue(value ? String(value) : "");
    }, [value]);

    // Sync disabled state
    useEffect(() => {
        if (!choicesRef.current) return;
        if (disabled) choicesRef.current.disable();
        else choicesRef.current.enable();
    }, [disabled]);

    return (
        <>
            <select ref={selectRef} defaultValue={value} className={className} />
            <style>{`
                .qwin-choices {
                    width: 100%;
                    font-size: 0.875rem;
                    margin-bottom: 0;
                }
                .qwin-choices .choices__inner {
                    background: var(--color-bg, #fff);
                    border: 1px solid ${error ? "var(--color-danger, #ef4444)" : "var(--color-border, #e5e7eb)"};
                    border-radius: 0.5rem;
                    padding: 0.625rem 1rem;
                    min-height: unset;
                    font-size: 0.875rem;
                    color: var(--color-text, #111);
                    transition: border-color 0.15s, box-shadow 0.15s;
                    cursor: pointer;
                }
                .qwin-choices.is-focused .choices__inner,
                .qwin-choices.is-open .choices__inner {
                    border-color: var(--color-primary, #27ae60);
                    box-shadow: 0 0 0 3px rgba(39,174,96,0.1);
                    outline: none;
                }
                .qwin-choices .choices__list--single {
                    padding: 0;
                }
                .qwin-choices .choices__list--single .choices__item {
                    color: var(--color-text, #111);
                    font-size: 0.875rem;
                }
                .qwin-choices .choices__placeholder {
                    color: rgba(107,114,128,0.4);
                    opacity: 1;
                }
                .qwin-choices[data-type*="select-one"]::after {
                    border-color: var(--color-muted, #6b7280) transparent transparent transparent;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-width: 5px;
                    margin-top: 0;
                }
                .qwin-choices[data-type*="select-one"].is-open::after {
                    border-color: transparent transparent var(--color-primary, #27ae60) transparent;
                    top: 50%;
                    transform: translateY(-60%);
                    margin-top: 0;
                }
                .qwin-choices .choices__list--dropdown,
                .qwin-choices .choices__list[aria-expanded] {
                    background: var(--color-bg, #fff);
                    border: 1px solid var(--color-border, #e5e7eb);
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
                    margin-top: 4px;
                    overflow: hidden;
                    z-index: 9999;
                }
                .qwin-choices .choices__list--dropdown .choices__input,
                .qwin-choices .choices__list[aria-expanded] .choices__input {
                    background: var(--color-surface, #f9fafb);
                    border-bottom: 1px solid var(--color-border, #e5e7eb);
                    color: var(--color-text, #111);
                    font-size: 0.8125rem;
                    padding: 8px 12px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .qwin-choices .choices__list--dropdown .choices__input:focus,
                .qwin-choices .choices__list[aria-expanded] .choices__input:focus {
                    outline: none;
                }
                .qwin-choices .choices__list--dropdown .choices__item,
                .qwin-choices .choices__list[aria-expanded] .choices__item {
                    font-size: 0.875rem;
                    color: var(--color-text, #111);
                    padding: 9px 14px;
                    transition: background 0.1s;
                    cursor: pointer;
                }
                .qwin-choices .choices__list--dropdown .choices__item--selectable.is-highlighted,
                .qwin-choices .choices__list[aria-expanded] .choices__item--selectable.is-highlighted {
                    background: var(--color-surface, #f9fafb);
                    color: var(--color-primary, #27ae60);
                }
                .qwin-choices .choices__list--dropdown .choices__item.is-selected,
                .qwin-choices .choices__list[aria-expanded] .choices__item.is-selected {
                    background: rgba(39,174,96,0.08);
                    color: var(--color-primary, #27ae60);
                    font-weight: 600;
                }
                .qwin-choices .choices__list--dropdown .choices__item--disabled,
                .qwin-choices .choices__list[aria-expanded] .choices__item--disabled {
                    color: var(--color-muted, #9ca3af);
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .qwin-choices .choices__list--dropdown .has-no-results,
                .qwin-choices .choices__list[aria-expanded] .has-no-results {
                    color: var(--color-muted, #9ca3af);
                    font-size: 0.8125rem;
                    padding: 10px 14px;
                    text-align: center;
                }
            `}</style>
        </>
    );
};

export default ChoicesSelect;
