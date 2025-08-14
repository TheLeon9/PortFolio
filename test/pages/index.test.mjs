import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '@/pages/index.js';
import { sectionsInformation } from '@/constants';

describe('IndexPage', () => {
  it('displays the correct section based on activeSection', () => {
    const activeSection = '2'; // Projects
    render(<IndexPage activeSection={activeSection} />);

    const section = sectionsInformation[parseInt(activeSection)];

    // Check that the colored title is displayed
    expect(screen.getByText(section.coloredTitle)).toBeInTheDocument();

    // Optionally check that the section text is displayed
    expect(screen.getByText(section.text)).toBeInTheDocument();
  });

  it('displays nothing if activeSection is invalid', () => {
    render(<IndexPage activeSection="999" />);

    // Ensure that none of the known section titles are rendered
    sectionsInformation.forEach((section) => {
      expect(screen.queryByText(section.coloredTitle)).not.toBeInTheDocument();
    });
  });
});
