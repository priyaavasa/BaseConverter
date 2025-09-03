// --- ns-conv.ts ---
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HostListener } from '@angular/core';

import { trigger, transition, style, animate } from '@angular/animations';

interface HistoryItem {
  from: string;
  fromBase: number;
  to: string;
  toBase: number;
  timestamp: Date;
}

interface ConversionStep {
  title: string;
  content: string;
  visual: SafeHtml;
  explanation: string;
}

@Component({
  selector: 'app-ns-conv',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ns-conv.html',
  styles: [
    `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        --primary-bg: #1a1a2e;
        --secondary-bg: #16213e;
        --accent-color: #0f3460;
        --text-primary: #ffffff;
        --text-secondary: #a8b2d1;
        --highlight-orange: #ff6b35;
        --highlight-blue: #4dabf7;
        --highlight-green: #51cf66;
        --highlight-purple: #9775fa;
        --border-color: #2d3748;
        --card-bg: rgba(255, 255, 255, 0.05);
      }

      [data-theme='light'] {
        --primary-bg: #f8fafc;
        --secondary-bg: #ffffff;
        --accent-color: #e2e8f0;
        --text-primary: #1a202c;
        --text-secondary: #4a5568;
        --border-color: #e2e8f0;
        --card-bg: rgba(0, 0, 0, 0.02);
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: var(--primary-bg);
        color: var(--text-primary);
        transition: all 0.3s ease;
      }

      .container {
        min-height: 100vh;
        padding: 20px;
        background: linear-gradient(
          135deg,
          var(--primary-bg) 0%,
          var(--secondary-bg) 100%
        );
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
        position: relative;
      }

      .header h1 {
        font-size: 2.5rem;
        background: linear-gradient(
          45deg,
          var(--highlight-blue),
          var(--highlight-purple)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 10px;
      }

      .theme-toggle {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 50px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .theme-toggle:hover {
        background: var(--accent-color);
      }

      .main-content {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 30px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .input-panel,
      .visual-panel {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 25px;
        backdrop-filter: blur(10px);
      }

      .input-group {
        margin-bottom: 20px;
      }

      .input-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--text-secondary);
      }

      .input-group input,
      .input-group select {
        width: 100%;
        padding: 12px;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--secondary-bg);
        color: var(--text-primary);
        font-size: 16px;
        transition: border-color 0.3s ease;
      }

      .input-group input:focus,
      .input-group select:focus {
        outline: none;
        border-color: var(--highlight-blue);
      }

      .convert-btn,
      .control-btn {
        width: auto;
        padding: 15px 25px;
        background: linear-gradient(
          45deg,
          var(--highlight-blue),
          var(--highlight-purple)
        );
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        margin: 10px 6px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
        transition: transform 0.2s ease, box-shadow 0.3s ease;
      }

      .convert-btn:hover,
      .control-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
      }

      .control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--border-color);
        box-shadow: none;
      }

      .control-btn.active {
        background: linear-gradient(
          45deg,
          var(--highlight-orange),
          var(--highlight-purple)
        );
        color: white;
      }

      .animation-container {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .step-title {
        font-size: 1.5rem;
        text-align: center;
        margin-bottom: 20px;
        color: var(--highlight-blue);
      }

      .number-block {
        background: linear-gradient(
          45deg,
          var(--highlight-blue),
          var(--highlight-purple)
        );
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 1.5rem;
        font-weight: bold;
        min-width: 80px;
        text-align: center;
        transition: all 0.3s ease;
      }

      .number-block.highlight {
        animation: pulse 1s infinite;
        border: 3px solid var(--highlight-orange);
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
      }

      .history-delete {
        background: none;
        border: none;
        color: var(--highlight-orange);
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0 10px;
        transition: color 0.3s ease;
      }

      .history-delete:hover {
        color: red;
        transform: scale(1.2);
      }

      button {
        font-family: inherit;
        cursor: pointer;
        outline: none;
        transition: all 0.3s ease;
        border: none;
      }

      @media (max-width: 768px) {
        .main-content {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .header h1 {
          font-size: 2rem;
        }

        .controls {
          flex-direction: column;
        }

        .control-btn {
          width: 100%;
        }
      }
      /* Conversion Progress Timeline Enhancement */
      .progress-timeline {
        margin-top: 40px;
        padding: 20px;
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .progress-timeline h3 {
        text-align: center;
        font-size: 1.3rem;
        color: var(--highlight-blue);
        margin-bottom: 10px;
      }

      .timeline {
        position: relative;
        height: 8px;
        background: var(--border-color);
        border-radius: 4px;
        margin-top: 25px;
        overflow: hidden;
      }

      .timeline-line {
        position: absolute;
        top: 0;
        left: 0;
        height: 8px;
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
      }

      .timeline-progress {
        position: absolute;
        top: 0;
        left: 0;
        height: 8px;
        background: linear-gradient(
          to right,
          var(--highlight-orange),
          var(--highlight-blue)
        );
        transition: width 0.4s ease-in-out;
        border-radius: 4px;
      }

      .timeline-node {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 28px;
        background: var(--secondary-bg);
        border: 3px solid var(--highlight-blue);
        border-radius: 50%;
        color: white;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        line-height: 22px;
        z-index: 1;
        transition: transform 0.2s, background 0.3s, border-color 0.3s;
        cursor: pointer;
      }

      .timeline-node.completed {
        background: var(--highlight-green);
        border-color: var(--highlight-green);
      }

      .timeline-node.current {
        background: var(--highlight-orange);
        border-color: white;
        transform: translate(-50%, -50%) scale(1.2);
      }

      .timeline-node:hover {
        transform: translate(-50%, -50%) scale(1.15);
        background: var(--highlight-purple);
      }

      .timeline-node .tooltip {
        visibility: hidden;
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--accent-color);
        color: white;
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 6px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 2;
      }

      .timeline-node:hover .tooltip {
        visibility: visible;
        opacity: 1;
      }
      html,
      body {
        height: 100%;
        overflow: hidden; /* Prevent full page scroll */
      }

      .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: linear-gradient(
          135deg,
          var(--primary-bg) 0%,
          var(--secondary-bg) 100%
        );
        padding: 0;
        margin: 0;
      }

      .header {
        flex-shrink: 0;
        padding: 20px;
      }

      .main-content {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 20px;
        padding: 20px;
        overflow: hidden;
      }

      .input-panel,
      .visual-panel {
        overflow-y: auto;
        max-height: 100%;
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 20px;
      }

      .animation-container {
        overflow-y: auto;
        max-height: 300px;
      }

      .controls {
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 10px;
      }

      .progress-timeline {
        max-height: 120px;
        overflow-y: auto;
        margin-top: 10px;
      }
      .conversion-visual .number-block {
        padding: 12px 20px;
        border-radius: 12px;
        background: linear-gradient(to right, #2e8bff, #6a32ff);
        color: white;
        box-shadow: 0 0 15px rgba(138, 43, 226, 0.6);
        animation: floatPulse 2s infinite ease-in-out;
        font-size: 1.2rem;
        margin: 0 8px;
        text-align: center;
        min-width: 60px;
      }

      @keyframes floatPulse {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      .arrow {
        font-size: 1.5rem;
        color: var(--highlight, #ffcc00);
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
      /* Cool title styling */
      .step-title {
        font-size: 1.8rem;
        font-weight: bold;
        background: linear-gradient(to right, #00c6ff, #0072ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: glowTitle 2s infinite alternate;
      }

      /* Step content styling */
      .operation-display {
        font-size: 1.2rem;
        margin-top: 0.8rem;
        padding: 1rem;
        border-left: 4px solid #00bcd4;
        background-color: rgba(0, 188, 212, 0.1);
        border-radius: 8px;
        color: #00acc1;
        font-weight: 500;
        box-shadow: 0 2px 5px rgba(0, 188, 212, 0.3);
        transition: transform 0.3s ease;
      }

      .operation-display:hover {
        transform: translateY(-2px);
      }

      /* Explanation panel (green hue) */
      .operation-display[style*='--highlight-green'] {
        border-left: 4px solid #4caf50;
        background-color: rgba(76, 175, 80, 0.1);
        color: #388e3c;
        box-shadow: 0 2px 5px rgba(76, 175, 80, 0.3);
      }

      /* Timeline step tooltip styling */
      .tooltip {
        background: #0f2027;
        color: #00e5ff;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        font-size: 0.85rem;
        border: 1px solid #00e5ff;
        box-shadow: 0 0 5px #00e5ff;
      }

      /* Glowing effect */
      @keyframes glowTitle {
        from {
          text-shadow: 0 0 5px #00c6ff, 0 0 10px #00c6ff, 0 0 20px #0072ff;
        }
        to {
          text-shadow: 0 0 10px #0072ff, 0 0 20px #00c6ff, 0 0 30px #0072ff;
        }
      }
      .result-text {
        color: #ff4081;
        font-weight: 600;
        font-family: 'Fira Code', monospace;
        background: linear-gradient(to right, #ff6ec4, #7873f5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NSConv {
  currentNumber: string = '';
  fromBase: string = '10';
  toBase: string = '2';
  currentStep: number = 0;
  conversionSteps: ConversionStep[] = [];
  isAutoPlaying: boolean = false;
  currentStepTitle: string = 'Ready to Convert! 🎯';
  currentStepVisual: SafeHtml = '';
  currentStepContent: string = '';
  currentStepExplanation: string = '';
  timelineProgress: number = 0;
  history: HistoryItem[] = [];
  playbackSpeed: number = 2000;
  private autoPlayInterval?: any;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.nextStep();
    } else if (event.key === 'ArrowLeft') {
      this.previousStep();
    }
  }

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {
    this.init();
  }

  init(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem('conversionHistory');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    } catch (e) {
      this.history = [];
    }
  }

  saveHistory(): void {
    try {
      localStorage.setItem('conversionHistory', JSON.stringify(this.history));
    } catch (e) {}
  }

  addToHistory(
    fromNum: string,
    fromBase: string,
    toNum: string,
    toBase: string
  ): void {
    const historyItem: HistoryItem = {
      from: fromNum,
      fromBase: parseInt(fromBase),
      to: toNum,
      toBase: parseInt(toBase),
      timestamp: new Date(),
    };
    this.history.unshift(historyItem);
    if (this.history.length > 20) this.history.splice(20);
    this.saveHistory();
  }

  toggleTheme(): void {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
  }

  isValidNumber(num: string, base: number): boolean {
    if (!num || num.trim() === '') return false;

    // Handle negative numbers
    const cleanNum = num.replace(/^-/, '');
    if (cleanNum === '') return false;

    // Get valid characters for the base
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);

    // Check if all characters are valid for this base
    return cleanNum
      .toUpperCase()
      .split('')
      .every((char) => validChars.includes(char));
  }

  // Convert any base to decimal
  convertToDecimal(num: string, base: number): number {
    const cleanNum = num.replace(/^-/, '');
    const isNegative = num.startsWith('-');

    let decimal = 0;
    const digits = cleanNum.toUpperCase().split('').reverse();

    for (let i = 0; i < digits.length; i++) {
      const digit = this.getDigitValue(digits[i]);
      decimal += digit * Math.pow(base, i);
    }

    return isNegative ? -decimal : decimal;
  }

  // Convert decimal to any base
  convertFromDecimal(decimal: number, base: number): string {
    if (decimal === 0) return '0';

    const isNegative = decimal < 0;
    decimal = Math.abs(decimal);

    let result = '';
    while (decimal > 0) {
      const remainder = decimal % base;
      result = this.getDigitChar(remainder) + result;
      decimal = Math.floor(decimal / base);
    }

    return isNegative ? '-' + result : result;
  }

  // Get numeric value of a digit character
  getDigitValue(char: string): number {
    if (char >= '0' && char <= '9') {
      return parseInt(char);
    } else if (char >= 'A' && char <= 'Z') {
      return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    }
    return 0;
  }

  // Get character representation of a digit value
  getDigitChar(value: number): string {
    if (value < 10) {
      return value.toString();
    } else {
      return String.fromCharCode('A'.charCodeAt(0) + value - 10);
    }
  }

  startConversion(): void {
    const fromBase = parseInt(this.fromBase);
    const toBase = parseInt(this.toBase);

    if (
      !this.currentNumber ||
      !this.isValidNumber(this.currentNumber, fromBase)
    ) {
      alert(
        `⚠️ Please enter a valid number for base ${fromBase}!\n\nValid characters for base ${fromBase}: ${this.getValidCharsForBase(
          fromBase
        )}`
      );
      return;
    }

    if (fromBase === toBase) {
      alert(
        '⚠️ Source and target bases cannot be the same. Please choose different bases.'
      );
      return;
    }

    console.log('🎯 Starting conversion with detailed explanations...');
    this.generateConversionSteps();
    this.currentStep = 0;
    this.updateStep();

    const result =
      this.conversionSteps.at(-1)?.content.match(/Final Result: (.+)/)?.[1] ||
      '';
    this.addToHistory(this.currentNumber, this.fromBase, result, this.toBase);

    // Optional backend call for validation
    const payload = {
      number: this.currentNumber,
      fromBase: this.fromBase,
      toBase: this.toBase,
    };

    this.http.post<any>('http://localhost:3000/convert', payload).subscribe(
      (res) => {
        console.log('✅ Backend validation successful:', res);
      },
      (err) => {
        console.warn('⚠️ Backend unavailable (using client-side only):', err);
      }
    );
  }

  generateConversionSteps(): void {
    const from = parseInt(this.fromBase);
    const to = parseInt(this.toBase);
    const input = this.currentNumber.trim();
    const isNegative = input.startsWith('-');
    const cleanInput = input.replace(/^-/, '').toUpperCase();

    const steps: ConversionStep[] = [];

    // Introduction step
    steps.push({
      title: `🎯 Converting ${this.getBaseInfo(from)} to ${this.getBaseInfo(
        to
      )}`,
      content: `Converting ${input} from base ${from} to base ${to}`,
      visual: this.sanitizer.bypassSecurityTrustHtml(
        `<div class="conversion-intro" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 10px 0;">
          <div class="conversion-overview" style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <div class="source-info" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; min-width: 120px;">
              <div style="font-size: 0.9em; opacity: 0.8;">FROM</div>
              <div style="font-size: 1.8em; font-weight: bold; margin: 5px 0;">${input}</div>
              <div style="font-size: 0.9em; opacity: 0.9;">${this.getBaseInfo(
                from
              )}</div>
              <div style="font-size: 0.8em; opacity: 0.7;">Base ${from}</div>
            </div>
            <div class="arrow" style="font-size: 2em; opacity: 0.8;">→</div>
            <div class="target-info" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; min-width: 120px;">
              <div style="font-size: 0.9em; opacity: 0.8;">TO</div>
              <div style="font-size: 1.8em; font-weight: bold; margin: 5px 0;">?</div>
              <div style="font-size: 0.9em; opacity: 0.9;">${this.getBaseInfo(
                to
              )}</div>
              <div style="font-size: 0.8em; opacity: 0.7;">Base ${to}</div>
            </div>
          </div>
          <div class="base-info" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.9em;">
            <div><strong>Base ${from}</strong> uses digits: ${this.getValidCharsForBase(
          from
        )}</div>
            <div><strong>Base ${to}</strong> uses digits: ${this.getValidCharsForBase(
          to
        )}</div>
          </div>
        </div>`
      ),
      explanation: `We're converting ${input} from ${this.getBaseInfo(
        from
      )} (base ${from}) to ${this.getBaseInfo(to)} (base ${to}). ${
        isNegative
          ? "The number is negative, so we'll preserve the sign throughout the conversion."
          : ''
      }`,
    });

    // Step 1: Convert to decimal (if not already decimal)
    let decimal = 0;
    if (from !== 10) {
      decimal = this.convertToDecimal(cleanInput, from);

      steps.push({
        title: `Step 1: Convert ${this.getBaseInfo(from)} to Decimal`,
        content: `Converting ${cleanInput} from base ${from} to decimal`,
        visual: this.sanitizer.bypassSecurityTrustHtml(
          `<div class="conversion-step" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #28a745;">
            <div class="step-header" style="text-align: center; margin-bottom: 15px;">
              <div style="font-size: 1.2em; font-weight: bold; color: #495057;">Base ${from} → Decimal Conversion</div>
            </div>
            <div class="conversion-formula" style="background: #e9ecef; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 10px;">
              <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Using positional notation:</div>
              <div style="font-size: 1.1em; font-weight: bold;">Each digit × (base^position) = contribution</div>
            </div>
          </div>`
        ),
        explanation: `In positional notation, each digit's value depends on its position. For base ${from}, each position represents a power of ${from}. We'll multiply each digit by its positional value and sum them up.`,
      });

      // Show detailed breakdown for each digit
      const digits = cleanInput.split('').reverse();
      let runningTotal = 0;

      digits.forEach((char, index) => {
        const digit = this.getDigitValue(char);
        const positionalValue = Math.pow(from, index);
        const contribution = digit * positionalValue;
        runningTotal += contribution;

        const visual = this.sanitizer.bypassSecurityTrustHtml(
          `<div class="digit-breakdown" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #007bff;">
            <div class="digit-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
              <span class="digit-badge" style="background: #007bff; color: white; padding: 8px 12px; border-radius: 50%; font-weight: bold; font-size: 1.2em; min-width: 40px; text-align: center;">${char}</span>
              <div class="position-info">
                <div style="font-size: 0.9em; color: #6c757d;">Position ${index} (from right)</div>
                <div style="font-size: 0.8em; color: #868e96;">Value: ${digit}, Weight: ${from}^${index}</div>
              </div>
            </div>
            <div class="calculation" style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
              <div style="font-size: 1.1em; text-align: center; margin-bottom: 8px;">
                <span style="color: #1976d2; font-weight: bold;">${digit}</span>
                <span style="color: #666; margin: 0 8px;">×</span>
                <span style="color: #388e3c; font-weight: bold;">${from}^${index}</span>
                <span style="color: #666; margin: 0 8px;">=</span>
                <span style="color: #1976d2; font-weight: bold;">${digit}</span>
                <span style="color: #666; margin: 0 8px;">×</span>
                <span style="color: #388e3c; font-weight: bold;">${positionalValue}</span>
                <span style="color: #666; margin: 0 8px;">=</span>
                <span style="background: #ffc107; color: #333; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${contribution}</span>
              </div>
            </div>
            <div class="running-total" style="background: #e8f5e8; padding: 10px; border-radius: 6px; text-align: center;">
              <span style="color: #2e7d32; font-weight: bold;">Running Total: ${runningTotal}</span>
            </div>
          </div>`
        );

        steps.push({
          title: `Processing digit '${char}' at position ${index}`,
          content: `'${char}' (value ${digit}) × ${from}^${index} = ${digit} × ${positionalValue} = ${contribution}`,
          visual,
          explanation: `The digit '${char}' has value ${digit} and is at position ${index} from the right. In base ${from}, position ${index} represents ${from}^${index} = ${positionalValue}. So this digit contributes ${contribution} to the total.`,
        });
      });

      // Show decimal result
      steps.push({
        title: `Decimal Result`,
        content: `${cleanInput} in base ${from} equals ${decimal} in decimal`,
        visual: this.sanitizer.bypassSecurityTrustHtml(
          `<div class="decimal-result" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 15px 0;">
            <div class="result-summary" style="margin-bottom: 15px;">
              <div style="font-size: 1.1em; opacity: 0.9; margin-bottom: 10px;">Sum of all contributions:</div>
              <div style="font-size: 2em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                ${cleanInput}<sub style="font-size: 0.5em;">${from}</sub> = ${decimal}<sub style="font-size: 0.5em;">10</sub>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; font-size: 0.9em;">
              ${
                isNegative
                  ? `Original number was negative, so: ${input} = ${
                      isNegative ? '-' : ''
                    }${decimal}`
                  : `Decimal value: ${decimal}`
              }
            </div>
          </div>`
        ),
        explanation: `Adding all contributions: ${digits
          .map(
            (char, i) =>
              `${this.getDigitValue(char)} × ${from}^${i} = ${
                this.getDigitValue(char) * Math.pow(from, i)
              }`
          )
          .join(' + ')} = ${decimal}`,
      });
    } else {
      decimal = parseInt(cleanInput, 10);
    }

    // Step 2: Convert from decimal to target base (if not already decimal)
    if (to !== 10) {
      const finalDecimal = isNegative ? -decimal : decimal;
      const absDecimal = Math.abs(finalDecimal);

      steps.push({
        title: `Step 2: Convert Decimal to ${this.getBaseInfo(to)}`,
        content: `Converting ${finalDecimal} from decimal to base ${to}`,
        visual: this.sanitizer.bypassSecurityTrustHtml(
          `<div class="conversion-step" style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #ffc107;">
            <div class="step-header" style="text-align: center; margin-bottom: 15px;">
              <div style="font-size: 1.2em; font-weight: bold; color: #495057;">Decimal → Base ${to} Conversion</div>
            </div>
            <div class="conversion-method" style="background: #050505ff; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 10px;">
              <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Using repeated division method:</div>
              <div style="font-size: 1.1em; font-weight: bold;">Divide by ${to}, collect remainders</div>
            </div>
          </div>`
        ),
        explanation: `To convert from decimal to base ${to}, we repeatedly divide by ${to} and collect the remainders. The remainders, read in reverse order, give us the digits in base ${to}.`,
      });

      // Perform division steps
      const remainders: number[] = [];
      let tempDecimal = absDecimal;
      let stepCount = 1;

      // Handle zero case
      if (tempDecimal === 0) {
        remainders.push(0);
      } else {
        while (tempDecimal > 0) {
          const quotient = Math.floor(tempDecimal / to);
          const remainder = tempDecimal % to;
          remainders.push(remainder);

          const visual = this.sanitizer.bypassSecurityTrustHtml(
            `<div class="division-step" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #17a2b8;">
              <div class="step-number" style="background: #17a2b8; color: white; padding: 5px 10px; border-radius: 15px; display: inline-block; font-size: 0.9em; font-weight: bold; margin-bottom: 10px;">
                Division ${stepCount}
              </div>
              <div class="division-visual" style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 15px 0; font-size: 1.2em;">
                <div class="dividend" style="background: #007bff; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold;">${tempDecimal}</div>
                <div class="operator" style="color: #6c757d; font-weight: bold;">÷</div>
                <div class="divisor" style="background: #28a745; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold;">${to}</div>
                <div class="equals" style="color: #6c757d; font-weight: bold;">=</div>
                <div class="quotient" style="background: #6f42c1; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold;">${quotient}</div>
                <div class="remainder-label" style="color: #6c757d; font-weight: bold;">R</div>
                <div class="remainder" style="background: #dc3545; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold;">${remainder}</div>
              </div>
              <div class="step-explanation" style="background: #e9ecef; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.9em; color: #495057; margin-bottom: 5px;">
                  Remainder <strong>${remainder}</strong> becomes digit <strong>'${this.getDigitChar(
              remainder
            )}'</strong> in base ${to}
                </div>
                ${
                  quotient > 0
                    ? `<div style="font-size: 0.8em; color: #6c757d;">Continue with quotient ${quotient}</div>`
                    : `<div style="font-size: 0.8em; color: #28a745; font-weight: bold;">✓ Done! (quotient is 0)</div>`
                }
              </div>
            </div>`
          );

          steps.push({
            title: `Division ${stepCount}: ${tempDecimal} ÷ ${to}`,
            content: `${tempDecimal} ÷ ${to} = ${quotient} remainder ${remainder}`,
            visual,
            explanation: `Dividing ${tempDecimal} by ${to} gives quotient ${quotient} and remainder ${remainder}. The remainder ${remainder} becomes the digit '${this.getDigitChar(
              remainder
            )}' in base ${to}. ${
              quotient > 0
                ? `We continue with quotient ${quotient}.`
                : 'Since quotient is 0, we stop here.'
            }`,
          });

          tempDecimal = quotient;
          stepCount++;
        }
      }

      // Show final result
      const finalResult = remainders
        .reverse()
        .map((r) => this.getDigitChar(r))
        .join('');
      const finalWithSign = isNegative ? '-' + finalResult : finalResult;

      steps.push({
        title: ` Final Result`,
        content: `Final Result: ${finalWithSign}`,
        visual: this.sanitizer.bypassSecurityTrustHtml(
          `<div class="final-result" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <div class="result-header" style="margin-bottom: 20px;">
              <div style="font-size: 1.1em; opacity: 0.9; margin-bottom: 8px;">Conversion Complete!</div>
              <div style="font-size: 2.2em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                ${input}<sub style="font-size: 0.4em;">${from}</sub> = ${finalWithSign}<sub style="font-size: 0.4em;">${to}</sub>
              </div>
            </div>
            <div class="remainders-sequence" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 8px;">Remainders collected:</div>
              <div style="font-size: 1.1em; margin-bottom: 8px;">
                ${remainders
                  .map(
                    (r, i) =>
                      `<span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block;">${r} → '${this.getDigitChar(
                        r
                      )}'</span>`
                  )
                  .join('')}
              </div>
              <div style="font-size: 0.8em; opacity: 0.7;">Read from last to first to get final answer</div>
            </div>
            <div class="verification" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; font-size: 0.9em; opacity: 0.9;">
              ✓ Verification: ${input} (${this.getBaseInfo(
            from
          )}) = ${finalWithSign} (${this.getBaseInfo(to)})
            </div>
          </div>`
        ),
        explanation: `The remainders collected are: ${remainders
          .map((r) => `${r} (digit '${this.getDigitChar(r)}')`)
          .join(
            ', '
          )}. Reading these from last to first gives us ${finalResult}. ${
          isNegative
            ? `Since the original number was negative, our final answer is ${finalWithSign}.`
            : `Therefore, ${input} in base ${from} equals ${finalResult} in base ${to}.`
        }`,
      });
    } else {
      // Target is decimal, so we're done
      const finalResult = isNegative ? -decimal : decimal;
      steps.push({
        title: `Final Result`,
        content: `Final Result: ${finalResult}`,
        visual: this.sanitizer.bypassSecurityTrustHtml(
          `<div class="final-result" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <div class="result-header" style="margin-bottom: 20px;">
              <div style="font-size: 1.1em; opacity: 0.9; margin-bottom: 8px;">Conversion Complete!</div>
              <div style="font-size: 2.2em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                ${input}<sub style="font-size: 0.4em;">${from}</sub> = ${finalResult}<sub style="font-size: 0.4em;">10</sub>
              </div>
            </div>
            <div class="verification" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; font-size: 0.9em; opacity: 0.9;">
              ✓ ${input} (${this.getBaseInfo(from)}) = ${finalResult} (Decimal)
            </div>
          </div>`
        ),
        explanation: `The conversion is complete! ${input} in ${this.getBaseInfo(
          from
        )} equals ${finalResult} in decimal.`,
      });
    }

    this.conversionSteps = steps;
  }

  getValidCharsForBase(base: number): string {
    if (base <= 10) {
      return `0-${base - 1}`;
    } else {
      return `0-9, A-${String.fromCharCode('A'.charCodeAt(0) + base - 11)}`;
    }
  }

  updateStep(): void {
    if (
      this.conversionSteps.length > 0 &&
      this.currentStep < this.conversionSteps.length
    ) {
      const step = this.conversionSteps[this.currentStep];
      this.currentStepTitle = step.title;
      this.currentStepVisual = step.visual;

      this.typeOut(step.content, () => {
        this.currentStepExplanation = step.explanation;
      });

      this.timelineProgress =
        ((this.currentStep + 1) / this.conversionSteps.length) * 100;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStep();
    }
  }

  nextStep(): void {
    if (this.currentStep < this.conversionSteps.length - 1) {
      this.currentStep++;
      this.updateStep();
    }
  }

  toggleAutoPlay(): void {
    if (this.isAutoPlaying) {
      clearInterval(this.autoPlayInterval);
      this.isAutoPlaying = false;
    } else {
      this.isAutoPlaying = true;
      this.autoPlayInterval = setInterval(() => {
        if (this.currentStep < this.conversionSteps.length - 1) {
          this.nextStep();
        } else {
          this.toggleAutoPlay();
        }
      }, this.playbackSpeed);
    }
  }

  restartAnimation(): void {
    this.currentStep = 0;
    this.updateStep();
  }

  skipToEnd(): void {
    this.currentStep = this.conversionSteps.length - 1;
    this.updateStep();
  }

  goToStep(index: number): void {
    this.currentStep = index;
    this.updateStep();
  }

  clearHistory(): void {
    if (confirm('Are you sure you want to clear all history?')) {
      this.history = [];
      this.saveHistory();
    }
  }

  typeOut(text: string, callback: () => void) {
    this.currentStepContent = '';
    let i = 0;
    const interval = setInterval(() => {
      this.currentStepContent += text.charAt(i++);
      if (i === text.length) {
        clearInterval(interval);
        callback();
      }
    }, 20);
  }

  deleteHistoryItem(index: number): void {
    this.history.splice(index, 1);
    this.saveHistory();
  }

  loadFromHistory(item: HistoryItem): void {
    this.currentNumber = item.from;
    this.fromBase = item.fromBase.toString();
    this.toBase = item.toBase.toString();
    this.startConversion();
  }

  exportSteps(): void {
    const data = {
      conversion: {
        from: this.currentNumber,
        fromBase: this.fromBase,
        toBase: this.toBase,
        timestamp: new Date().toISOString(),
      },
      steps: this.conversionSteps.map((step) => ({
        title: step.title,
        content: step.content,
        explanation: step.explanation,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversion_${this.currentNumber}_base${this.fromBase}_to_base${this.toBase}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getBaseInfo(base: number): string {
    const baseNames: { [key: number]: string } = {
      2: 'Binary',
      8: 'Octal',
      10: 'Decimal',
      16: 'Hexadecimal',
    };
    return baseNames[base] || `Base ${base}`;
  }

  onSpeedChange(event: any): void {
    this.playbackSpeed = parseInt(event.target.value);
    if (this.isAutoPlaying) {
      this.toggleAutoPlay();
      this.toggleAutoPlay();
    }
  }

  ngOnDestroy(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }
}

// Interface definitions
interface ConversionStep {
  title: string;
  content: string;
  visual: SafeHtml;
  explanation: string;
}

interface HistoryItem {
  from: string;
  fromBase: number;
  to: string;
  toBase: number;
  timestamp: Date;
}
