import React from 'react';
import { Button } from '../ui/button';
import { HiDotsHorizontal, HiPlus } from 'react-icons/hi';
import { Menu } from '@headlessui/react';
import { FoodEntry } from '../../types/food';

interface ActionButtonsProps {
  onAddFood: () => void;
  clipboardEntries: FoodEntry[];
  filteredEntries: FoodEntry[];
  selectedEntries: string[];
  onCopyPreviousDay: () => void;
  onCopyCurrentDay: () => void;
  onCopySelectedItems: () => void;
  onPasteEntries: () => void;
  onDeleteSelected: () => void;
  onCopyToToday?: () => void;
  isToday: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddFood,
  clipboardEntries,
  filteredEntries,
  selectedEntries,
  onCopyPreviousDay,
  onCopyCurrentDay,
  onCopySelectedItems,
  onPasteEntries,
  onDeleteSelected,
  onCopyToToday,
  isToday
}) => {
  return (
    <div className="flex justify-end items-center mb-6">
      <div className="flex items-center">
        <Button
          onClick={onAddFood}
          variant="ghost"
          className="flex items-center text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer !bg-primary hover:!bg-[#5a37d9] active:!bg-[#4e2fc7]"
        >
          <HiPlus className="mr-1 h-5 w-5" />
          Add Food
        </Button>
        
        {/* Clipboard indicator */}
        {clipboardEntries.length > 0 && (
          <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            📋 {clipboardEntries.length} copied
          </div>
        )}
        
        <div className="relative ml-2">
          <Menu>
            <Menu.Button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors duration-200">
              <HiDotsHorizontal className="h-5 w-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md`}
                      onClick={onCopyPreviousDay}
                    >
                      Copy Previous Day
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md`}
                      onClick={onCopyCurrentDay}
                      disabled={filteredEntries.length === 0}
                    >
                      Copy Current Day
                    </button>
                  )}
                </Menu.Item>
                {!isToday && filteredEntries.length > 0 && onCopyToToday && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md`}
                        onClick={onCopyToToday}
                      >
                        Copy to Today
                      </button>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md ${selectedEntries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={onCopySelectedItems}
                      disabled={selectedEntries.length === 0}
                    >
                      Copy Selected Items
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md ${clipboardEntries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={onPasteEntries}
                      disabled={clipboardEntries.length === 0}
                    >
                      Paste {clipboardEntries.length > 0 ? `(${clipboardEntries.length} items)` : ''}
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md`}
                      onClick={onDeleteSelected}
                    >
                      Delete Selected
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </div>
  );
};
