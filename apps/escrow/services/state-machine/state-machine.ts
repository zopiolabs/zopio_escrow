/**
 * SPDX-License-Identifier: MIT
 */

import type { EscrowStatus, StateTransition } from '../../types/escrow';

export class StateMachine {
  private transitions: StateTransition[];

  constructor() {
    this.transitions = [
      // From DRAFT
      {
        from: 'DRAFT',
        to: 'PENDING_PAYMENT',
        conditions: ['buyer_assigned', 'product_verified'],
        actions: ['send_payment_link'],
      },
      {
        from: 'DRAFT',
        to: 'CANCELLED',
        conditions: [],
        actions: ['notify_parties', 'cleanup_resources'],
      },

      // From PENDING_PAYMENT
      {
        from: 'PENDING_PAYMENT',
        to: 'PAYMENT_RECEIVED',
        conditions: ['payment_confirmed'],
        actions: ['notify_seller', 'hold_funds'],
      },
      {
        from: 'PENDING_PAYMENT',
        to: 'CANCELLED',
        conditions: ['payment_timeout', 'user_requested'],
        actions: ['notify_parties', 'cleanup_resources'],
      },

      // From PAYMENT_RECEIVED
      {
        from: 'PAYMENT_RECEIVED',
        to: 'PENDING_DELIVERY',
        conditions: ['seller_confirmed'],
        actions: ['notify_buyer', 'prepare_delivery'],
      },
      {
        from: 'PAYMENT_RECEIVED',
        to: 'DISPUTED',
        conditions: ['dispute_raised'],
        actions: ['freeze_transaction', 'notify_admin'],
      },
      {
        from: 'PAYMENT_RECEIVED',
        to: 'REFUNDED',
        conditions: ['seller_cancelled', 'admin_approved'],
        actions: ['process_refund', 'notify_buyer'],
      },

      // From PENDING_DELIVERY
      {
        from: 'PENDING_DELIVERY',
        to: 'DELIVERED',
        conditions: ['delivery_confirmed'],
        actions: ['notify_buyer', 'start_completion_timer'],
      },
      {
        from: 'PENDING_DELIVERY',
        to: 'DISPUTED',
        conditions: ['dispute_raised'],
        actions: ['freeze_transaction', 'notify_admin'],
      },

      // From DELIVERED
      {
        from: 'DELIVERED',
        to: 'COMPLETED',
        conditions: ['buyer_confirmed', 'auto_completion_timer_expired'],
        actions: ['release_funds', 'notify_parties', 'close_transaction'],
      },
      {
        from: 'DELIVERED',
        to: 'DISPUTED',
        conditions: ['dispute_raised', 'within_dispute_window'],
        actions: ['freeze_transaction', 'notify_admin'],
      },

      // From DISPUTED
      {
        from: 'DISPUTED',
        to: 'COMPLETED',
        conditions: ['dispute_resolved_in_favor_of_seller'],
        actions: ['release_funds', 'notify_parties', 'close_dispute'],
      },
      {
        from: 'DISPUTED',
        to: 'REFUNDED',
        conditions: ['dispute_resolved_in_favor_of_buyer'],
        actions: ['process_refund', 'notify_parties', 'close_dispute'],
      },

      // Terminal states (COMPLETED, CANCELLED, REFUNDED) have no outgoing transitions
    ];
  }

  /**
   * Check if a state transition is valid
   */
  canTransition(from: EscrowStatus, to: EscrowStatus): boolean {
    return this.transitions.some(
      (transition) => transition.from === from && transition.to === to
    );
  }

  /**
   * Get all possible transitions from a given state
   */
  getPossibleTransitions(from: EscrowStatus): StateTransition[] {
    return this.transitions.filter((transition) => transition.from === from);
  }

  /**
   * Get all possible next states from a given state
   */
  getPossibleNextStates(from: EscrowStatus): EscrowStatus[] {
    return this.transitions
      .filter((transition) => transition.from === from)
      .map((transition) => transition.to);
  }

  /**
   * Get the transition details for a specific state change
   */
  getTransition(
    from: EscrowStatus,
    to: EscrowStatus
  ): StateTransition | undefined {
    return this.transitions.find(
      (transition) => transition.from === from && transition.to === to
    );
  }

  /**
   * Validate if conditions are met for a transition
   */
  validateTransitionConditions(
    from: EscrowStatus,
    to: EscrowStatus,
    context: Record<string, boolean>
  ): { valid: boolean; missingConditions: string[] } {
    const transition = this.getTransition(from, to);

    if (!transition) {
      return {
        valid: false,
        missingConditions: ['Invalid transition'],
      };
    }

    const missingConditions: string[] = [];

    if (transition.conditions) {
      for (const condition of transition.conditions) {
        if (!context[condition]) {
          missingConditions.push(condition);
        }
      }
    }

    return {
      valid: missingConditions.length === 0,
      missingConditions,
    };
  }

  /**
   * Get actions that should be executed for a transition
   */
  getTransitionActions(from: EscrowStatus, to: EscrowStatus): string[] {
    const transition = this.getTransition(from, to);
    return transition?.actions || [];
  }

  /**
   * Check if a state is terminal (no outgoing transitions)
   */
  isTerminalState(state: EscrowStatus): boolean {
    return !this.transitions.some((transition) => transition.from === state);
  }

  /**
   * Get all terminal states
   */
  getTerminalStates(): EscrowStatus[] {
    const allStates = this.getAllStates();
    return allStates.filter((state) => this.isTerminalState(state));
  }

  /**
   * Get all states in the state machine
   */
  getAllStates(): EscrowStatus[] {
    const states = new Set<EscrowStatus>();

    for (const transition of this.transitions) {
      states.add(transition.from);
      states.add(transition.to);
    }

    return Array.from(states);
  }

  /**
   * Get the initial state
   */
  getInitialState(): EscrowStatus {
    return 'DRAFT';
  }

  /**
   * Validate the entire state machine for consistency
   */
  validateStateMachine(): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const allStates = this.getAllStates();

    // Check for unreachable states
    const reachableStates = new Set<EscrowStatus>([this.getInitialState()]);

    let changed = true;
    while (changed) {
      changed = false;
      for (const state of reachableStates) {
        for (const nextState of this.getPossibleNextStates(state)) {
          if (!reachableStates.has(nextState)) {
            reachableStates.add(nextState);
            changed = true;
          }
        }
      }
    }

    const unreachableStates = allStates.filter(
      (state) => !reachableStates.has(state)
    );
    if (unreachableStates.length > 0) {
      issues.push(`Unreachable states: ${unreachableStates.join(', ')}`);
    }

    // Check for states with no outgoing transitions (should be terminal)
    const statesWithoutTransitions = allStates.filter(
      (state) => !this.transitions.some((t) => t.from === state)
    );

    const expectedTerminalStates: EscrowStatus[] = [
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ];
    const unexpectedTerminalStates = statesWithoutTransitions.filter(
      (state) => !expectedTerminalStates.includes(state)
    );

    if (unexpectedTerminalStates.length > 0) {
      issues.push(
        `Unexpected terminal states: ${unexpectedTerminalStates.join(', ')}`
      );
    }

    // Check for duplicate transitions
    const transitionKeys = new Set<string>();
    for (const transition of this.transitions) {
      const key = `${transition.from}->${transition.to}`;
      if (transitionKeys.has(key)) {
        issues.push(`Duplicate transition: ${key}`);
      }
      transitionKeys.add(key);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate a DOT graph representation of the state machine
   */
  toDotGraph(): string {
    let dot = 'digraph EscrowStateMachine {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=circle];\n';

    // Mark initial state
    dot += `  ${this.getInitialState()} [style=bold];\n`;

    // Mark terminal states
    const terminalStates = this.getTerminalStates();
    for (const state of terminalStates) {
      dot += `  ${state} [shape=doublecircle];\n`;
    }

    // Add transitions
    for (const transition of this.transitions) {
      const label = transition.conditions?.join(',') || '';
      dot += `  ${transition.from} -> ${transition.to}`;
      if (label) {
        dot += ` [label="${label}"]`;
      }
      dot += ';\n';
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Execute a transition with full validation and actions
   */
  async executeTransition(
    from: EscrowStatus,
    to: EscrowStatus,
    context: Record<string, boolean>,
    actionExecutor?: (actions: string[]) => Promise<void>
  ): Promise<{
    success: boolean;
    newState?: EscrowStatus;
    error?: string;
    executedActions?: string[];
  }> {
    try {
      // Validate transition
      if (!this.canTransition(from, to)) {
        return {
          success: false,
          error: `Invalid transition from ${from} to ${to}`,
        };
      }

      // Validate conditions
      const validation = this.validateTransitionConditions(from, to, context);
      if (!validation.valid) {
        return {
          success: false,
          error: `Conditions not met: ${validation.missingConditions.join(', ')}`,
        };
      }

      // Execute actions
      const actions = this.getTransitionActions(from, to);
      if (actionExecutor) {
        await actionExecutor(actions);
      }

      return {
        success: true,
        newState: to,
        executedActions: actions,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to execute actions: ${error}`,
      };
    }
  }
}
